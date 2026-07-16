import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuizService } from '../quiz/quiz.service';
import { Difficulty } from '@jebkharch/shared';
import { WithdrawalStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
  ) {}

  // ── User Management ───────────────────────────────────────────────────────

  async getUsers(page = 1, pageSize = 20, search?: string) {
    const skip = (page - 1) * pageSize;
    const where = search
      ? { OR: [{ name: { contains: search } }, { phone: { contains: search } }] }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, phone: true, name: true, coins: true, xp: true,
          fraudScore: true, isBanned: true, isFlagged: true, isPro: true,
          role: true, createdAt: true, lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async banUser(adminId: string, userId: string, reason: string) {
    if (userId === adminId) throw new Error('Cannot ban yourself.');
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason },
    });
    this.logger.log(`Admin ${adminId} banned user ${userId}: ${reason}`);
    return { message: 'User banned.' };
  }

  async unbanUser(adminId: string, userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null, fraudScore: 0, isFlagged: false },
    });
    this.logger.log(`Admin ${adminId} unbanned user ${userId}`);
    return { message: 'User unbanned.' };
  }

  // ── Withdrawal Management ─────────────────────────────────────────────────

  async getWithdrawals(status?: WithdrawalStatus, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: { user: { select: { name: true, phone: true, fraudScore: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return { data: withdrawals, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async approveWithdrawal(adminId: string, withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found.');

    // TODO: Call IPayoutProvider.sendPayout() here
    // const providerRef = await this.payoutProvider.sendPayout(withdrawal.easypaisaNumber, withdrawal.coins);

    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: WithdrawalStatus.APPROVED,
        approvedById: adminId,
        processedAt: new Date(),
        providerRef: `MOCK_${uuidv4().slice(0, 8).toUpperCase()}`, // mock Easypaisa ref
      },
    });

    // Update wallet transaction status
    await this.prisma.walletTransaction.updateMany({
      where: { referenceId: withdrawalId },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Admin ${adminId} approved withdrawal ${withdrawalId}`);
    return { message: 'Withdrawal approved.' };
  }

  async rejectWithdrawal(adminId: string, withdrawalId: string, reason: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { select: { coins: true } } },
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found.');

    // Refund coins to user
    await this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
          approvedById: adminId,
          rejectionReason: reason,
          processedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { coins: { increment: withdrawal.coins } },
      });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId: withdrawal.userId,
          type: 'CREDIT',
          amount: withdrawal.coins,
          source: 'ADMIN_ADJUSTMENT' as any,
          status: 'COMPLETED',
          referenceId: withdrawalId,
          balanceBefore: withdrawal.user.coins,
          balanceAfter: withdrawal.user.coins + withdrawal.coins,
          description: `Withdrawal rejected: ${reason} — coins refunded`,
        },
      });
    });

    this.logger.log(`Admin ${adminId} rejected withdrawal ${withdrawalId}: ${reason}`);
    return { message: 'Withdrawal rejected and coins refunded.' };
  }

  // ── Quiz / Content Management ─────────────────────────────────────────────

  async generateQuestions(categoryId: string, count: number, difficulty: Difficulty) {
    return this.quizService.generateQuestionsForCategory(categoryId, count, difficulty);
  }

  async getFlaggedQuestions(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    return this.prisma.question.findMany({
      where: { OR: [{ isFlagged: true }, { isApproved: false }] },
      include: { category: true },
      skip,
      take: pageSize,
    });
  }

  async moderateQuestion(questionId: string, approve: boolean) {
    await this.prisma.question.update({
      where: { id: questionId },
      data: { isApproved: approve, isFlagged: false },
    });
    return { message: approve ? 'Question approved.' : 'Question rejected.' };
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics() {
    const today = dayjs().startOf('day').toDate();
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();
    const lastWeek = dayjs().subtract(7, 'day').startOf('day').toDate();

    const [
      totalUsers,
      dauToday,
      dauYesterday,
      totalQuizSessions,
      completedSessions,
      totalWithdrawals,
      pendingWithdrawals,
      totalCoinsInCirculation,
      flaggedUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: today } } }),
      this.prisma.user.count({ where: { lastLoginAt: { gte: yesterday, lt: today } } }),
      this.prisma.quizSession.count(),
      this.prisma.quizSession.count({ where: { isCompleted: true } }),
      this.prisma.withdrawal.count(),
      this.prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      this.prisma.user.aggregate({ _sum: { coins: true } }),
      this.prisma.user.count({ where: { isFlagged: true } }),
    ]);

    return {
      users: { total: totalUsers, dauToday, dauYesterday, flagged: flaggedUsers },
      quizzes: { totalSessions: totalQuizSessions, completedSessions },
      withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals },
      economy: { totalCoinsInCirculation: totalCoinsInCirculation._sum.coins || 0 },
    };
  }
}
