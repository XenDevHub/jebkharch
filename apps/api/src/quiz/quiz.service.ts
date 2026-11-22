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
import { MissionsService } from '../missions/missions.service';
import { StreakService } from '../streak/streak.service';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly missionsService: MissionsService,
    private readonly streakService: StreakService,
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

  async getDailyChallengeStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySession = await this.prisma.quizSession.findFirst({
      where: {
        userId,
        isDailyChallenge: true,
        startedAt: { gte: today },
      },
      orderBy: { startedAt: 'desc' },
      include: { category: true },
    });

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hasPlayed = !!todaySession && todaySession.isCompleted;

    return {
      canPlay: !hasPlayed,
      alreadyPlayed: hasPlayed,
      isCompleted: hasPlayed,
      nextAvailableAt: tomorrow.toISOString(),
      lastSession: todaySession ? {
        sessionId: todaySession.id,
        score: todaySession.score,
        coinsWon: todaySession.coinsWon,
        categoryName: todaySession.category?.name,
        completedAt: todaySession.endedAt,
      } : null,
    };
  }

  async startQuiz(userId: string, categoryId: string, isDailyChallenge = false) {
    // Validate category
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found.');
    }

    // Check if daily challenge was already played today
    if (isDailyChallenge) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCompleted = await this.prisma.quizSession.findFirst({
        where: {
          userId,
          isDailyChallenge: true,
          isCompleted: true,
          startedAt: { gte: today },
        },
      });
      if (todayCompleted) {
        throw new BadRequestException('Aaj ka Daily Challenge pehle hi mukammal ho chuka hai! Kal naya challenge milega.');
      }
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

    // Check lives (hearts)
    if (user.lives <= 0) {
      throw new BadRequestException('Out of lives! ❤️ Watch an ad or refill with coins to continue playing.');
    }

    // Check daily earning cap (to prevent infinite farming)
    const todayEarned = await this.getTodayEarned(userId);
    // Still allow playing even at cap — just won't earn rewards

    // Fetch questions (ensure no repeats until pool exhausted)
    const questions = await this.fetchQuestionsForCategory(userId, categoryId, QUIZ_CONSTANTS.QUESTIONS_PER_SESSION);

    // Atomic: deduct entry fee + 1 life + create session
    const session = await this.prisma.$transaction(async (tx) => {
      // Deduct coins & 1 life
      const userUpdateData: any = {
        coins: { decrement: COIN_CONSTANTS.NORMAL_QUIZ_ENTRY },
        lives: { decrement: 1 },
      };
      if (user.lives >= 5) {
        userUpdateData.lastLifeRefillAt = new Date();
      }

      await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
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
          isDailyChallenge: !!isDailyChallenge,
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
      questions: questions.map((q: any) => ({
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

    // Save to wrong_answers for "Learn from Mistakes" review
    if (!isCorrect) {
      await this.prisma.wrongAnswer.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: { practiceCount: { increment: 1 }, masteredAt: null },
        create: {
          id: uuidv4(),
          userId,
          questionId,
          sessionId,
        },
      }).catch((e: any) => this.logger.warn(`Failed to record wrong answer: ${e?.message}`));
    }

    return { isCorrect, correctAnswer: question.correctAnswer };
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

    // Determine reward with 2x multiplier for Daily Challenge
    const baseReward = QUIZ_REWARDS[correctCount] ?? 0;
    const rawReward = session.isDailyChallenge ? baseReward * 2 : baseReward;

    // Apply daily earning cap (only quiz gameplay earnings, excludes missions/challenges)
    const todayEarned = await this.getTodayEarned(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const dailyCap = parseInt(this.config.get('DAILY_EARNING_CAP') || '500', 10);
    const remainingCap = Math.max(0, dailyCap - todayEarned);
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
        const newXp = user!.xp + finalXp;
        const newLevel = Math.max(user!.level, Math.floor(Math.sqrt(newXp / 100)) + 1);

        const userUpdateData: any = {
          coins: { increment: coinsWon },
          xp: newXp,
          level: newLevel,
        };
        if (session.isDailyChallenge) {
          userUpdateData.lastDailyChallengeAt = new Date();
        }

        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });

        // Award points to the user's Clan/Team if they belong to one
        if (user?.teamId && correctCount > 0) {
          await tx.team.update({
            where: { id: user.teamId },
            data: { score: { increment: correctCount * 10 } },
          }).catch(() => null);
        }

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
            description: session.isDailyChallenge
              ? `Daily Challenge 2× reward: ${correctCount}/${QUIZ_CONSTANTS.QUESTIONS_PER_SESSION} (${coinsWon} coins)`
              : `Quiz reward: ${correctCount}/${QUIZ_CONSTANTS.QUESTIONS_PER_SESSION} correct`,
          },
        });
      } else {
        // Still update XP
        if (finalXp > 0) {
          const newXp = user!.xp + finalXp;
          const newLevel = Math.max(user!.level, Math.floor(Math.sqrt(newXp / 100)) + 1);
          await tx.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } });
        }
      }
    });

    // Update daily streak and handle streak freeze
    try {
      await this.streakService.recordQuizStreak(userId);
    } catch (e: any) {
      this.logger.warn(`Failed to update streak: ${e?.message}`);
    }

    // Update missions and achievements
    try {
      await this.missionsService.updateMissionProgress(userId, 'QUIZ_PLAYED', 1);
      if (correctCount >= 5) {
        await this.missionsService.updateMissionProgress(userId, 'PERFECT_SCORE', 5);
      }
      await this.missionsService.checkAndUnlockAchievements(userId);
    } catch (e: any) {
      this.logger.warn(`Failed to update missions/achievements: ${e?.message}`);
    }

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

Return ONLY a valid JSON object with a "questions" key containing an array of questions:
{
  "questions": [
    {
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "A|B|C|D",
      "explanation": "..."
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    let questions: any[];
    try {
      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      questions = Array.isArray(parsed)
        ? parsed
        : (parsed.questions || (Object.values(parsed).find((v) => Array.isArray(v)) as any[]) || []);
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
        source: TransactionSource.QUIZ_REWARD as any,
        description: { startsWith: 'Quiz reward:' },
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
      coinsEarned: session.coinsWon,
      isDailyChallenge: session.isDailyChallenge ?? false,
      multiplier: session.isDailyChallenge ? 2 : 1,
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
