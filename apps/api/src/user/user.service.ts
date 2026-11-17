import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, name: true, email: true, dob: true,
        avatarUrl: true, coins: true, xp: true, rank: true,
        isPro: true, referralCode: true, isBanned: true, createdAt: true,
        currentStreak: true, longestStreak: true, streakFreezes: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    // Calculate stats and dynamic leaderboard rank
    const [totalQuizzes, correctAnswers, totalAnswers, totalChallenges, challengesWon, higherXpCount] = await Promise.all([
      this.prisma.quizSession.count({ where: { userId, isCompleted: true } }),
      this.prisma.quizAnswer.count({
        where: { session: { userId }, isCorrect: true },
      }),
      this.prisma.quizAnswer.count({ where: { session: { userId } } }),
      this.prisma.challenge.count({
        where: { OR: [{ creatorId: userId }, { opponentId: userId }], status: 'COMPLETED' },
      }),
      this.prisma.challenge.count({ where: { winnerId: userId } }),
      this.prisma.user.count({ where: { xp: { gt: user.xp } } }),
    ]);

    const dynamicRank = higherXpCount + 1;

    return {
      ...user,
      rank: dynamicRank,
      stats: {
        totalQuizzes,
        accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        totalChallenges,
        challengeWinRate: totalChallenges > 0 ? Math.round((challengesWon / totalChallenges) * 100) : 0,
      },
    };
  }

  async updateProfile(userId: string, updates: Partial<{ name: string; email: string; dob: Date; easypaisaNumber: string }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, name: true, email: true, dob: true },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) throw new NotFoundException('User not found.');

    if (user.passwordHash) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) throw new BadRequestException('Current password is incorrect.');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { message: 'Password updated successfully.' };
  }

  async getLeaderboard(page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isBanned: false },
        select: { id: true, name: true, avatarUrl: true, coins: true, xp: true, rank: true },
        orderBy: { xp: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where: { isBanned: false } }),
    ]);

    return {
      data: users.map((u, i) => ({ ...u, position: skip + i + 1 })),
      total,
      page,
      pageSize,
    };
  }

  async updatePushToken(userId: string, token: string) {
    this.logger.log(`Registering push token for user ${userId}: ${token}`);
    return this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
  }
}
