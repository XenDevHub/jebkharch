import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType, TransactionSource } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class BonusService {
  private readonly MAX_LIVES = 5;
  private readonly LIFE_REFILL_MINUTES = 30;

  constructor(private prisma: PrismaService) {}

  async getLives(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    let lives = user.lives;
    let lastRefill = dayjs(user.lastLifeRefillAt);
    const now = dayjs();

    if (lives < this.MAX_LIVES) {
      const minutesPassed = now.diff(lastRefill, 'minute');
      const livesToRecover = Math.floor(minutesPassed / this.LIFE_REFILL_MINUTES);
      
      if (livesToRecover > 0) {
        lives = Math.min(this.MAX_LIVES, lives + livesToRecover);
        // Advance refill timer exactly by the intervals consumed
        lastRefill = lastRefill.add(livesToRecover * this.LIFE_REFILL_MINUTES, 'minute');
        
        await this.prisma.user.update({
          where: { id: userId },
          data: { lives, lastLifeRefillAt: lastRefill.toDate() },
        });
      }
    }

    const nextRefillInSeconds = lives < this.MAX_LIVES 
      ? (this.LIFE_REFILL_MINUTES * 60) - now.diff(lastRefill, 'second')
      : 0;

    return {
      lives,
      maxLives: this.MAX_LIVES,
      nextRefillInSeconds: Math.max(0, nextRefillInSeconds),
    };
  }

  async spinWheel(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Only 1 free spin per day
    const now = dayjs();
    if (user.lastSpinAt && dayjs(user.lastSpinAt).isSame(now, 'day')) {
      throw new BadRequestException('You already used your free spin today! Come back tomorrow.');
    }

    // Determine Reward
    // Options: 10 coins, 50 coins, 1 ticket, 50 XP, 1 Streak Freeze
    const r = Math.random();
    let rewardType = '';
    let rewardValue = 0;
    let title = '';

    if (r < 0.05) { rewardType = 'freeze'; rewardValue = 1; title = '1 Streak Freeze'; } // 5%
    else if (r < 0.15) { rewardType = 'ticket'; rewardValue = 1; title = '1 Tournament Ticket'; } // 10%
    else if (r < 0.40) { rewardType = 'coins'; rewardValue = 50; title = '50 Coins'; } // 25%
    else if (r < 0.70) { rewardType = 'xp'; rewardValue = 50; title = '50 XP'; } // 30%
    else { rewardType = 'coins'; rewardValue = 10; title = '10 Coins'; } // 30%

    await this.prisma.$transaction(async (tx) => {
      // Grant reward
      if (rewardType === 'freeze') {
        await tx.user.update({ where: { id: userId }, data: { streakFreezes: { increment: 1 }, lastSpinAt: now.toDate() } });
      } else if (rewardType === 'ticket') {
        await tx.user.update({ where: { id: userId }, data: { tournamentTickets: { increment: 1 }, lastSpinAt: now.toDate() } });
      } else if (rewardType === 'xp') {
        await tx.user.update({ where: { id: userId }, data: { xp: { increment: 50 }, lastSpinAt: now.toDate() } });
      } else if (rewardType === 'coins') {
        await tx.user.update({ where: { id: userId }, data: { coins: { increment: rewardValue }, lastSpinAt: now.toDate() } });
        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId,
            type: TransactionType.CREDIT,
            amount: rewardValue,
            source: TransactionSource.DAILY_LOGIN as any, // fallback since SPIN is not in enum
            description: 'Spin Wheel Reward',
            balanceBefore: user.coins,
            balanceAfter: user.coins + rewardValue,
          }
        });
      }
    });

    return { rewardType, rewardValue, title };
  }

  async watchAd(userId: string, adType: string, rewardType: 'coins' | 'life') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const rewardCoins = 15;

    await this.prisma.$transaction(async (tx) => {
      if (rewardType === 'life') {
        if (user.lives >= this.MAX_LIVES) throw new BadRequestException('Already at max lives');
        await tx.user.update({ where: { id: userId }, data: { lives: { increment: 1 } } });
      } else {
        await tx.user.update({ where: { id: userId }, data: { coins: { increment: rewardCoins } } });
        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId,
            type: TransactionType.CREDIT,
            amount: rewardCoins,
            source: TransactionSource.AD_REWARD,
            description: 'Rewarded Ad',
            balanceBefore: user.coins,
            balanceAfter: user.coins + rewardCoins,
          }
        });
      }

      await tx.adLog.create({
        data: {
          id: uuidv4(),
          userId,
          adType: 'REWARDED',
          reward: rewardType === 'coins' ? rewardCoins : 0,
        }
      });
    });

    return { success: true, rewardType, rewardCoins };
  }
}
