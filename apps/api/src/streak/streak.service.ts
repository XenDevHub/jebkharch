import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreakService {
  constructor(private prisma: PrismaService) {}

  async getStreakStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
        streakFreezes: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const todayStr = new Date().toISOString().split('T')[0];
    const lastStreakStr = user.lastStreakDate
      ? new Date(user.lastStreakDate).toISOString().split('T')[0]
      : null;

    const claimedToday = lastStreakStr === todayStr;

    // Daily rewards schedule (Day 1..7)
    const rewards = [10, 20, 30, 50, 75, 100, 200];
    const currentDayInCycle = ((user.currentStreak) % 7) || 7;
    const nextReward = rewards[(currentDayInCycle - 1) % 7];

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakFreezes: user.streakFreezes,
      claimedToday,
      currentDayInCycle,
      nextReward,
      rewardsSchedule: rewards,
    };
  }

  async claimDailyStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastStreakStr = user.lastStreakDate
      ? new Date(user.lastStreakDate).toISOString().split('T')[0]
      : null;

    if (lastStreakStr === todayStr) {
      throw new BadRequestException('Daily streak already claimed today');
    }

    let newStreak = user.currentStreak;
    let usedFreeze = false;
    if (lastStreakStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStreakStr === yesterdayStr) {
        newStreak += 1;
      } else {
        // Check if user has streak freeze
        if (user.streakFreezes > 0) {
          // Consume streak freeze automatically to keep streak!
          await this.prisma.user.update({
            where: { id: userId },
            data: { streakFreezes: { decrement: 1 } },
          });
          newStreak += 1;
          usedFreeze = true;
        } else {
          newStreak = 1; // Reset streak
        }
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak, newStreak);
    const rewards = [10, 20, 30, 50, 75, 100, 200];
    const rewardIndex = (newStreak - 1) % 7;
    const rewardCoins = rewards[rewardIndex];

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak,
          lastStreakDate: now,
          coins: { increment: rewardCoins },
        },
      }),
      this.prisma.streakLog.create({
        data: {
          userId,
          date: now,
          usedFreeze,
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          source: 'DAILY_LOGIN' as any, // fallback for streak bonus
          amount: rewardCoins,
          type: 'CREDIT',
          description: `Daily streak bonus (Day ${newStreak})`,
          balanceBefore: user.coins,
          balanceAfter: user.coins + rewardCoins,
        },
      }),
    ]);

    return {
      message: 'Streak claimed successfully!',
      currentStreak: newStreak,
      longestStreak,
      rewardCoins,
    };
  }

  async buyStreakFreeze(userId: string) {
    const cost = 200; // 200 coins per freeze
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, streakFreezes: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.coins < cost) {
      throw new BadRequestException(`Insufficient coins. Required: ${cost}`);
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: cost },
          streakFreezes: { increment: 1 },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          source: 'QUIZ_FEE' as any, // using QUIZ_FEE as fallback for store purchase
          type: 'DEBIT',
          amount: cost,
          description: 'Purchased Streak Freeze',
          balanceBefore: user.coins,
          balanceAfter: user.coins - cost,
        },
      }),
    ]);

    return {
      message: 'Streak freeze purchased successfully!',
      streakFreezes: user.streakFreezes + 1,
    };
  }
}
