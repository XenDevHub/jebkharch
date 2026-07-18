import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  COIN_CONSTANTS,
  QUIZ_CONSTANTS,
  QUIZ_REWARDS,
  Difficulty,
  TransactionSource,
} from '@jebkharch/shared';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType, TransactionStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-your-openai-key-here') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OpenAI key not configured — using seeded questions only');
    }
  }

  // ── Get Categories ────────────────────────────────────────────────────────

  async getCategories(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } });
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
      ...c,
      locked: c.isPremium && !user?.isPro,
    }));
  }

  // ── Start Quiz ────────────────────────────────────────────────────────────

  async startQuiz(userId: string, categoryId: string) {
    // Validate category
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found.');
    }

    // Premium check
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (category.isPremium && !user.isPro) {
      throw new ForbiddenException('This category requires a Pro subscription.');
    }

    // Check sufficient coins
    if (user.coins < COIN_CONSTANTS.NORMAL_QUIZ_ENTRY) {
      throw new BadRequestException(`Insufficient coins. You need ${COIN_CONSTANTS.NORMAL_QUIZ_ENTRY} coins to play.`);
    }

    // Check daily earning cap (to prevent infinite farming)
    const todayEarned = await this.getTodayEarned(userId);
    // Still allow playing even at cap — just won't earn rewards

    // Fetch questions (ensure no repeats until pool exhausted)
    const questions = await this.fetchQuestionsForCategory(userId, categoryId, QUIZ_CONSTANTS.QUESTIONS_PER_SESSION);

    // Atomic: deduct entry fee + create session
    const session = await this.prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: COIN_CONSTANTS.NORMAL_QUIZ_ENTRY } },
      });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId,
          type: TransactionType.DEBIT,
          amount: COIN_CONSTANTS.NORMAL_QUIZ_ENTRY,
          source: TransactionSource.QUIZ_ENTRY as any,
          status: TransactionStatus.COMPLETED,
          balanceBefore: user.coins,
          balanceAfter: user.coins - COIN_CONSTANTS.NORMAL_QUIZ_ENTRY,
          description: `Quiz entry: ${category.name}`,
        },
      });

      const newSession = await tx.quizSession.create({
        data: {
          id: uuidv4(),
          userId,
          categoryId,
          coinsSpent: COIN_CONSTANTS.NORMAL_QUIZ_ENTRY,
        },
      });

      return newSession;
    });

    return {
      sessionId: session.id,
      categoryName: category.name,
      totalQuestions: QUIZ_CONSTANTS.QUESTIONS_PER_SESSION,
      timePerQuestion: QUIZ_CONSTANTS.TIME_PER_QUESTION_SECONDS,
      coinsSpent: COIN_CONSTANTS.NORMAL_QUIZ_ENTRY,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        difficulty: q.difficulty,
      })),
    };
  }

  // ── Submit Answer ─────────────────────────────────────────────────────────

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    selectedAnswer: string,
    timeTaken: number,
  ) {
    const session = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, userId, isCompleted: false },
    });
    if (!session) throw new NotFoundException('Quiz session not found or already completed.');

    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found.');

    const isCorrect = selectedAnswer.toUpperCase() === question.correctAnswer.toUpperCase();

    // Upsert answer (idempotent)
    await this.prisma.quizAnswer.upsert({
      where: { sessionId_questionId: { sessionId, questionId } },
      update: { selectedAnswer, isCorrect, timeTaken },
      create: {
        id: uuidv4(),
        sessionId,
        questionId,
        selectedAnswer,
        isCorrect,
        timeTaken,
      },
    });

    // Increment question usage
    await this.prisma.question.update({
      where: { id: questionId },
      data: { usageCount: { increment: 1 } },
    });

    return { isCorrect };
  }

  // ── Finish Quiz ───────────────────────────────────────────────────────────

  async finishQuiz(userId: string, sessionId: string) {
    const session = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, userId },
      include: { answers: { include: { question: true } }, category: true },
    });

    if (!session) throw new NotFoundException('Quiz session not found.');
    if (session.isCompleted) {
      // Return cached result
      return this.buildQuizResult(session);
    }

    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const totalTimeTaken = session.answers.reduce((sum, a) => sum + a.timeTaken, 0);
    const xpGained = correctCount * 10;

    // Determine reward
    const rawReward = QUIZ_REWARDS[correctCount] ?? 0;

    // Apply daily earning cap
    const todayEarned = await this.getTodayEarned(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const remainingCap = Math.max(0, COIN_CONSTANTS.DAILY_EARNING_CAP - todayEarned);
    const coinsWon = Math.min(rawReward, remainingCap);

    // Apply Pro XP multiplier
    const finalXp = user?.isPro ? xpGained * 2 : xpGained;

    // Atomic: update session + grant reward
    await this.prisma.$transaction(async (tx) => {
      await tx.quizSession.update({
        where: { id: sessionId },
        data: {
          score: correctCount,
          coinsWon,
          xpGained: finalXp,
          timeTaken: totalTimeTaken,
          endedAt: new Date(),
          isCompleted: true,
        },
      });

      if (coinsWon > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            coins: { increment: coinsWon },
            xp: { increment: finalXp },
          },
        });

        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId,
            type: TransactionType.CREDIT,
            amount: coinsWon,
            source: TransactionSource.QUIZ_REWARD as any,
            status: TransactionStatus.COMPLETED,
            referenceId: sessionId,
            balanceBefore: user!.coins,
            balanceAfter: user!.coins + coinsWon,
            description: `Quiz reward: ${correctCount}/${QUIZ_CONSTANTS.QUESTIONS_PER_SESSION} correct`,
          },
        });
      } else {
        // Still update XP
        if (finalXp > 0) {
          await tx.user.update({ where: { id: userId }, data: { xp: { increment: finalXp } } });
        }
      }
    });

    const updatedSession = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { answers: { include: { question: true } }, category: true },
    });

    return this.buildQuizResult(updatedSession!);
  }

  // ── Quiz History ──────────────────────────────────────────────────────────

  async getHistory(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [sessions, total] = await Promise.all([
      this.prisma.quizSession.findMany({
        where: { userId, isCompleted: true },
        include: { category: true },
        orderBy: { startedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.quizSession.count({ where: { userId, isCompleted: true } }),
    ]);

    return {
      data: sessions.map((s) => ({
        id: s.id,
        category: s.category.name,
        score: s.score,
        totalQuestions: s.totalQ,
        coinsWon: s.coinsWon,
        coinsSpent: s.coinsSpent,
        timeTaken: s.timeTaken,
        playedAt: s.startedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ── AI Question Generation ────────────────────────────────────────────────

  async generateQuestionsForCategory(categoryId: string, count = 20, difficulty: Difficulty = Difficulty.MEDIUM) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found.');

    if (!this.openai) {
      this.logger.warn('OpenAI not configured — cannot generate questions');
      throw new BadRequestException('AI question generation requires OPENAI_API_KEY to be configured.');
    }

    this.logger.log(`Generating ${count} ${difficulty} questions for ${category.name}...`);

    const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${category.name}" at ${difficulty} difficulty level.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Exactly one option must be correct
- Include a brief explanation for the correct answer
- Questions should be appropriate for all ages
- Focus on factual, verifiable knowledge
- For Pakistani audience, include Pakistan-specific content where relevant
- Do NOT include offensive, political, or divisive content

Return ONLY a valid JSON array with this exact structure:
[
  {
    "questionText": "...",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctAnswer": "A|B|C|D",
    "explanation": "..."
  }
]`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    let questions: any[];
    try {
      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch {
      throw new BadRequestException('AI returned invalid response format.');
    }

    // Content moderation step
    const safeQuestions = questions.filter((q) => this.moderateQuestion(q));

    // Save approved questions to DB
    const created = await Promise.all(
      safeQuestions.map((q) =>
        this.prisma.question.create({
          data: {
            id: uuidv4(),
            categoryId,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: difficulty as any,
            createdByAi: true,
            isApproved: true,
          },
        }),
      ),
    );

    this.logger.log(`✅ Generated ${created.length} questions for ${category.name}`);
    return { generated: created.length, categoryId, difficulty };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async fetchQuestionsForCategory(userId: string, categoryId: string, count: number) {
    // Get questions the user hasn't answered recently (anti-repeat)
    const recentSessionIds = await this.prisma.quizSession.findMany({
      where: { userId, categoryId },
      select: { id: true },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const recentQuestionIds = recentSessionIds.length
      ? (
          await this.prisma.quizAnswer.findMany({
            where: { sessionId: { in: recentSessionIds.map((s) => s.id) } },
            select: { questionId: true },
            distinct: ['questionId'],
          })
        ).map((a) => a.questionId)
      : [];

    // Try to get unseen questions first
    let questions = await this.prisma.question.findMany({
      where: {
        categoryId,
        isApproved: true,
        id: recentQuestionIds.length ? { notIn: recentQuestionIds } : undefined,
      },
      take: count,
      orderBy: { usageCount: 'asc' }, // prefer less-used questions
    });

    // If not enough unique questions, backfill and potentially regenerate
    if (questions.length < count) {
      const needed = count - questions.length;
      const existingIds = questions.map((q) => q.id);
      const fallback = await this.prisma.question.findMany({
        where: { categoryId, isApproved: true, id: { notIn: existingIds } },
        take: needed,
        orderBy: { usageCount: 'asc' },
      });
      questions = [...questions, ...fallback];

      // If still not enough, try AI generation
      if (questions.length < count && this.openai) {
        const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
        this.logger.log(`Question pool exhausted for ${category?.name} — triggering AI generation`);
        try {
          await this.generateQuestionsForCategory(categoryId, 20, category?.difficulty as Difficulty);
          // Re-fetch
          const fresh = await this.prisma.question.findMany({
            where: { categoryId, isApproved: true, id: { notIn: existingIds } },
            take: needed - fallback.length,
          });
          questions = [...questions, ...fresh];
        } catch (e) {
          this.logger.error('Failed to auto-generate questions', e);
        }
      }
    }

    // Shuffle questions
    return this.shuffle(questions).slice(0, count);
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private moderateQuestion(q: any): boolean {
    if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer || !q.explanation) {
      return false;
    }
    // Basic content filter — block clearly problematic content
    const banned = ['violence', 'sex', 'explicit', 'kill', 'murder', 'drug', 'bomb'];
    const text = `${q.questionText} ${q.explanation}`.toLowerCase();
    if (banned.some((word) => text.includes(word))) return false;
    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) return false;
    return true;
  }

  private async getTodayEarned(userId: string): Promise<number> {
    const todayStart = dayjs().startOf('day').toDate();
    const result = await this.prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: TransactionType.CREDIT,
        source: { in: [TransactionSource.QUIZ_REWARD as any, TransactionSource.CHALLENGE_WIN as any, TransactionSource.AD_REWARD as any] },
        createdAt: { gte: todayStart },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private buildQuizResult(session: any) {
    return {
      sessionId: session.id,
      score: session.score,
      totalQuestions: session.totalQ,
      accuracy: Math.round((session.score / session.totalQ) * 100),
      timeTaken: session.timeTaken,
      coinsWon: session.coinsWon,
      coinsSpent: session.coinsSpent,
      xpGained: session.xpGained,
      categoryName: session.category?.name,
      answers: session.answers?.map((a: any) => ({
        questionId: a.questionId,
        questionText: a.question?.questionText,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: a.question?.correctAnswer,
        isCorrect: a.isCorrect,
        explanation: a.question?.explanation,
        timeTaken: a.timeTaken,
      })),
    };
  }
}
