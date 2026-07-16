import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { COIN_CONSTANTS, TransactionSource } from '@jebkharch/shared';
import { v4 as uuidv4 } from 'uuid';
import { WithdrawalStatus, TransactionType, TransactionStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Wallet Summary ────────────────────────────────────────────────────────

  async getWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });
    if (!user) throw new NotFoundException('User not found.');

    const [pendingWithdrawals, todayEarned, totalWithdrawn] = await Promise.all([
      this.prisma.withdrawal.aggregate({
        where: { userId, status: WithdrawalStatus.PENDING },
        _sum: { coins: true },
      }),
      this.getTodayEarned(userId),
      this.prisma.withdrawal.aggregate({
        where: { userId, status: WithdrawalStatus.APPROVED },
        _sum: { coins: true },
      }),
    ]);

    return {
      totalCoins: user.coins,
      pendingWithdrawals: pendingWithdrawals._sum.coins || 0,
      todayEarned,
      totalWithdrawn: totalWithdrawn._sum.coins || 0,
      minWithdrawal: COIN_CONSTANTS.MIN_WITHDRAWAL,
      dailyCap: COIN_CONSTANTS.DAILY_EARNING_CAP,
    };
  }

  // ── Withdraw ──────────────────────────────────────────────────────────────

  async requestWithdrawal(userId: string, easypaisaNumber: string, coins: number) {
    // Validate amount
    if (coins < COIN_CONSTANTS.MIN_WITHDRAWAL) {
      throw new BadRequestException(`Minimum withdrawal is ${COIN_CONSTANTS.MIN_WITHDRAWAL} coins.`);
    }

    // Validate Easypaisa number
    if (!/^03\d{9}$/.test(easypaisaNumber)) {
      throw new BadRequestException('Please provide a valid Easypaisa number (03XXXXXXXXX format).');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    if (user.coins < coins) {
      throw new BadRequestException(`Insufficient coins. You have ${user.coins} coins.`);
    }

    // Check 24-hour cooldown
    const lastWithdrawal = await this.prisma.withdrawal.findFirst({
      where: { userId, createdAt: { gte: dayjs().subtract(COIN_CONSTANTS.WITHDRAWAL_COOLDOWN_HOURS, 'hour').toDate() } },
      orderBy: { createdAt: 'desc' },
    });
    if (lastWithdrawal) {
      const hoursLeft = COIN_CONSTANTS.WITHDRAWAL_COOLDOWN_HOURS - dayjs().diff(dayjs(lastWithdrawal.createdAt), 'hour');
      throw new BadRequestException(`Withdrawal cooldown active. Please wait ${hoursLeft} more hour(s).`);
    }

    // Check if same Easypaisa number is used by multiple accounts (fraud signal)
    const otherUsersWithSameNumber = await this.prisma.withdrawal.findFirst({
      where: { easypaisaNumber, userId: { not: userId } },
    });
    if (otherUsersWithSameNumber) {
      this.logger.warn(`Shared Easypaisa number detected: ${easypaisaNumber} — user ${userId}`);
      // Flag for review but don't block — just trigger fraud score
      await this.prisma.fraudEvent.create({
        data: {
          id: uuidv4(),
          userId,
          reason: 'SHARED_EASYPAISA',
          detail: `Easypaisa number ${easypaisaNumber} used by multiple accounts`,
          severity: 3,
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { fraudScore: { increment: 20 }, isFlagged: true },
      });
    }

    const requiresReview = coins >= COIN_CONSTANTS.LARGE_WITHDRAWAL_THRESHOLD || user.isFlagged;

    // Atomic: deduct coins + create withdrawal
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: coins } },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          id: uuidv4(),
          userId,
          easypaisaNumber,
          coins,
          requiresReview,
          status: WithdrawalStatus.PENDING,
        },
      });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId,
          type: TransactionType.DEBIT,
          amount: coins,
          source: TransactionSource.WITHDRAWAL as any,
          status: TransactionStatus.PENDING,
          referenceId: withdrawal.id,
          balanceBefore: user.coins,
          balanceAfter: user.coins - coins,
          description: `Withdrawal to Easypaisa ${easypaisaNumber}`,
        },
      });

      return withdrawal;
    });

    return {
      message: requiresReview
        ? 'Withdrawal submitted for manual review. Processing may take 1-2 business days.'
        : 'Withdrawal submitted successfully. Processing within 24 hours.',
      coins,
      easypaisaNumber,
      requiresReview,
    };
  }

  // ── Transaction History ───────────────────────────────────────────────────

  async getTransactions(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ── Withdrawal History ────────────────────────────────────────────────────

  async getWithdrawalHistory(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getTodayEarned(userId: string): Promise<number> {
    const todayStart = dayjs().startOf('day').toDate();
    const result = await this.prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: TransactionType.CREDIT,
        createdAt: { gte: todayStart },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }
}
