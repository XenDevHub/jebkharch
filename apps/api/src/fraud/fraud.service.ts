import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FraudReason } from '@jebkharch/shared';
import { v4 as uuidv4 } from 'uuid';

const FRAUD_SCORE_THRESHOLDS = {
  FLAG: 50,   // flag for review
  HIGH: 70,   // high risk — restrict withdrawals
  BAN: 95,    // auto-ban (only for extreme/automated abuse)
};

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(
    userId: string,
    reason: FraudReason,
    detail?: string,
    severity = 1,
    context?: { ipAddress?: string; deviceId?: string },
  ) {
    this.logger.warn(`[FRAUD] User ${userId} — ${reason} (severity: ${severity}): ${detail}`);

    await this.prisma.fraudEvent.create({
      data: {
        id: uuidv4(),
        userId,
        reason,
        detail,
        severity,
        ipAddress: context?.ipAddress,
        deviceId: context?.deviceId,
      },
    });

    // Adjust fraud score based on severity
    const scoreIncrease = severity * 10;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fraudScore: { increment: scoreIncrease },
        isFlagged: true,
      },
      select: { fraudScore: true, isBanned: true },
    });

    // Auto-ban only for OTP spam (clear automated abuse)
    if (reason === FraudReason.OTP_SPAM && user.fraudScore >= FRAUD_SCORE_THRESHOLDS.BAN) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isBanned: true, banReason: 'Automated ban: OTP spam detected' },
      });
      this.logger.warn(`Auto-banned user ${userId} for OTP spam`);
    }

    return user;
  }

  async checkDeviceForMultipleAccounts(deviceId: string, currentUserId: string): Promise<string[]> {
    const sessions = await this.prisma.deviceSession.findMany({
      where: { deviceId, isActive: true, userId: { not: currentUserId } },
      select: { userId: true },
    });
    return sessions.map((s) => s.userId);
  }

  async getFraudReport(userId: string) {
    const [user, events] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fraudScore: true, isFlagged: true, isBanned: true },
      }),
      this.prisma.fraudEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      userId,
      fraudScore: user?.fraudScore,
      riskLevel: this.getRiskLevel(user?.fraudScore || 0),
      isFlagged: user?.isFlagged,
      isBanned: user?.isBanned,
      recentEvents: events,
    };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 20) return 'low';
    if (score < FRAUD_SCORE_THRESHOLDS.FLAG) return 'medium';
    if (score < FRAUD_SCORE_THRESHOLDS.HIGH) return 'high';
    return 'critical';
  }
}
