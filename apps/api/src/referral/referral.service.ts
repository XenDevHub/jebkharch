import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) throw new NotFoundException('User not found.');

    const [totalReferrals, totalReward] = await Promise.all([
      this.prisma.referral.count({ where: { referrerId: userId, rewardGiven: true } }),
      this.prisma.walletTransaction.aggregate({
        where: { userId, source: 'REFERRAL_BONUS' as any },
        _sum: { amount: true },
      }),
    ]);

    return {
      code: user.referralCode,
      shareLink: `https://jebkharch.pk/join?ref=${user.referralCode}`,
      totalReferrals,
      totalRewardEarned: totalReward._sum.amount || 0,
    };
  }

  async applyReferralCode(userId: string, referralCode: string, deviceId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    // Check user hasn't already been referred
    if (user.referredBy) {
      throw new BadRequestException('You have already used a referral code.');
    }

    const referrer = await this.prisma.user.findFirst({
      where: { referralCode: referralCode.toUpperCase() },
    });
    if (!referrer) throw new BadRequestException('Invalid referral code.');
    if (referrer.id === userId) throw new BadRequestException('You cannot use your own referral code.');

    // Device fraud check
    if (deviceId) {
      const deviceAlreadyReferred = await this.prisma.referral.findFirst({ where: { deviceId } });
      if (deviceAlreadyReferred) {
        this.logger.warn(`Referral fraud attempt: device ${deviceId} already claimed reward`);
        throw new BadRequestException('This device has already claimed a referral reward.');
      }
    }

    // This is normally handled during registration — this endpoint handles post-signup application
    await this.prisma.referral.create({
      data: {
        id: require('uuid').v4(),
        referrerId: referrer.id,
        referredUserId: userId,
        rewardGiven: true,
        deviceId,
      },
    });

    await this.prisma.user.update({ where: { id: userId }, data: { referredBy: referrer.id } });

    return { message: 'Referral code applied successfully!', referrerId: referrer.id };
  }
}
