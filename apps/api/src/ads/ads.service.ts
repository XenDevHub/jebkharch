import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { COIN_CONSTANTS } from '@jebkharch/shared';
import { v4 as uuidv4 } from 'uuid';
import { AdType, TransactionType, TransactionStatus } from '@prisma/client';
import { TransactionSource } from '@jebkharch/shared';
import * as dayjs from 'dayjs';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordAdWatch(userId: string, adType: AdType, deviceId?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    if (user.isPro) {
      throw new BadRequestException('Pro users do not have ads.');
    }

    // Only rewarded ads earn coins
    if (adType !== AdType.REWARDED) {
      await this.prisma.adLog.create({
        data: { id: uuidv4(), userId, adType, reward: 0, deviceId, ipAddress },
      });
      return { reward: 0, message: 'Ad logged.' };
    }

    // Check daily ad cap
    const todayStart = dayjs().startOf('day').toDate();
    const todayAdCount = await this.prisma.adLog.count({
      where: { userId, adType: AdType.REWARDED, watchedAt: { gte: todayStart } },
    });

    if (todayAdCount >= COIN_CONSTANTS.DAILY_AD_WATCH_CAP) {
      throw new BadRequestException(`Daily ad reward limit (${COIN_CONSTANTS.DAILY_AD_WATCH_CAP} ads) reached. Come back tomorrow!`);
    }

    // Detect ad farming: rapid watching from same IP
    const recentFromIp = ipAddress
      ? await this.prisma.adLog.count({
          where: { ipAddress, watchedAt: { gte: dayjs().subtract(1, 'minute').toDate() } },
        })
      : 0;

    if (recentFromIp > 5) {
      this.logger.warn(`Ad farming detected: IP ${ipAddress}, user ${userId}`);
      await this.prisma.fraudEvent.create({
        data: {
          id: uuidv4(),
          userId,
          reason: 'AD_FARMING',
          detail: `${recentFromIp} ad watches in 1 minute from IP ${ipAddress}`,
          severity: 2,
          ipAddress,
          deviceId,
        },
      });
      await this.prisma.user.update({ where: { id: userId }, data: { fraudScore: { increment: 10 } } });
    }

    // Random reward 1-3 coins
    const reward = Math.floor(Math.random() * COIN_CONSTANTS.AD_REWARD_MAX) + COIN_CONSTANTS.AD_REWARD_MIN;

    await this.prisma.$transaction(async (tx) => {
      await tx.adLog.create({
        data: { id: uuidv4(), userId, adType, reward, deviceId, ipAddress },
      });

      await tx.user.update({ where: { id: userId }, data: { coins: { increment: reward } } });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId,
          type: TransactionType.CREDIT,
          amount: reward,
          source: TransactionSource.AD_REWARD as any,
          status: TransactionStatus.COMPLETED,
          balanceBefore: user.coins,
          balanceAfter: user.coins + reward,
          description: `Rewarded ad bonus (${todayAdCount + 1}/${COIN_CONSTANTS.DAILY_AD_WATCH_CAP} today)`,
        },
      });
    });

    return {
      reward,
      message: `+${reward} coins earned!`,
      todayCount: todayAdCount + 1,
      remainingToday: COIN_CONSTANTS.DAILY_AD_WATCH_CAP - todayAdCount - 1,
    };
  }
}
