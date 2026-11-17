import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionSource, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(private prisma: PrismaService) {}

  async getMissions(userId: string) {
    const now = new Date();

    let userMissions = await this.prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { assignedAt: 'desc' },
    });

    const activeUnexpired = userMissions.filter(
      (um) => um.expiresAt > now && um.status === 'ACTIVE'
    );

    if (activeUnexpired.length === 0) {
      let missions = await this.prisma.mission.findMany({
        where: { isActive: true },
        take: 3,
      });

      if (missions.length === 0) {
        await this.prisma.mission.createMany({
          data: [
            { title: 'Daily Quiz Master', description: 'Play 3 quiz matches today', type: 'DAILY', targetValue: 3, rewardCoins: 50, rewardTickets: 0 },
            { title: 'Perfect Score', description: 'Get 5 correct answers in a row', type: 'DAILY', targetValue: 5, rewardCoins: 100, rewardTickets: 1 },
            { title: 'Weekly Champion', description: 'Win 10 tournament or challenge matches', type: 'WEEKLY', targetValue: 10, rewardCoins: 300, rewardTickets: 2 },
          ],
        });
        missions = await this.prisma.mission.findMany({ where: { isActive: true }, take: 3 });
      }

      const assignedAt = new Date();
      for (const m of missions) {
        const expiresAt = new Date();
        if (m.type === 'WEEKLY') {
          expiresAt.setDate(expiresAt.getDate() + 7);
        } else {
          expiresAt.setDate(expiresAt.getDate() + 1);
        }

        const exists = await this.prisma.userMission.findFirst({
          where: { userId, missionId: m.id, status: 'ACTIVE', expiresAt: { gt: now } },
        });

        if (!exists) {
          await this.prisma.userMission.create({
            data: {
              userId,
              missionId: m.id,
              progress: 0,
              status: 'ACTIVE',
              assignedAt,
              expiresAt,
            },
          });
        }
      }

      userMissions = await this.prisma.userMission.findMany({
        where: { userId },
        include: { mission: true },
        orderBy: { assignedAt: 'desc' },
      });
    }

    return userMissions;
  }

  async claimMission(userId: string, userMissionId: string) {
    const userMission = await this.prisma.userMission.findFirst({
      where: { id: userMissionId, userId },
      include: { mission: true, user: true },
    });

    if (!userMission) throw new NotFoundException('Mission not found');
    if (userMission.status === 'COMPLETED') {
      throw new BadRequestException('Mission reward already claimed');
    }
    if (userMission.progress < userMission.mission.targetValue) {
      throw new BadRequestException('Mission is not completed yet');
    }

    await this.prisma.$transaction([
      this.prisma.userMission.update({
        where: { id: userMissionId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: userMission.mission.rewardCoins },
          tournamentTickets: { increment: userMission.mission.rewardTickets },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          source: TransactionSource.QUIZ_REWARD,
          type: TransactionType.CREDIT,
          amount: userMission.mission.rewardCoins,
          status: TransactionStatus.COMPLETED,
          description: `Reward for mission: ${userMission.mission.title}`,
          balanceBefore: userMission.user.coins,
          balanceAfter: userMission.user.coins + userMission.mission.rewardCoins,
        },
      }),
    ]);

    return {
      message: 'Mission reward claimed!',
      rewardCoins: userMission.mission.rewardCoins,
      rewardTickets: userMission.mission.rewardTickets,
    };
  }

  async updateMissionProgress(
    userId: string,
    actionType: 'QUIZ_PLAYED' | 'PERFECT_SCORE' | 'CHALLENGE_WON',
    amount: number = 1,
  ) {
    try {
      await this.getMissions(userId);

      const activeMissions = await this.prisma.userMission.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        include: { mission: true },
      });

      for (const um of activeMissions) {
        let shouldUpdate = false;
        let incrementBy = 0;

        const title = um.mission.title.toLowerCase();
        const desc = um.mission.description.toLowerCase();

        if (actionType === 'QUIZ_PLAYED') {
          if (title.includes('quiz') || desc.includes('quiz')) {
            shouldUpdate = true;
            incrementBy = amount;
          }
        } else if (actionType === 'PERFECT_SCORE') {
          if (title.includes('perfect') || desc.includes('correct')) {
            shouldUpdate = true;
            incrementBy = amount;
          }
        } else if (actionType === 'CHALLENGE_WON') {
          if (title.includes('champion') || desc.includes('challenge') || desc.includes('tournament')) {
            shouldUpdate = true;
            incrementBy = amount;
          }
        }

        if (shouldUpdate && incrementBy > 0) {
          const newProgress = Math.min(um.mission.targetValue, um.progress + incrementBy);
          await this.prisma.userMission.update({
            where: { id: um.id },
            data: { progress: newProgress },
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to update mission progress for ${userId}: ${err.message}`);
    }
  }

  async getAchievements(userId: string) {
    let achievements = await this.prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (achievements.length === 0) {
      await this.prisma.achievement.createMany({
        data: [
          { key: 'FIRST_QUIZ', title: 'First Steps', description: 'Complete your first quiz match', icon: '🎓', rewardCoins: 50 },
          { key: 'PERFECT_SCORE', title: 'Perfectionist', description: 'Score a perfect 5/5 in a quiz', icon: '⭐', rewardCoins: 100 },
          { key: 'QUIZ_10', title: 'Quiz Whiz', description: 'Complete 10 quiz matches', icon: '🔥', rewardCoins: 200 },
          { key: 'CHALLENGE_WINNER', title: 'Duel Champion', description: 'Win a 1v1 challenge match', icon: '⚔️', rewardCoins: 100 },
          { key: 'STREAK_3', title: 'On Fire', description: 'Maintain a 3-day daily streak', icon: '⚡', rewardCoins: 150 },
          { key: 'STREAK_7', title: 'Unstoppable', description: 'Maintain a 7-day daily streak', icon: '👑', rewardCoins: 300 },
        ],
      });
      achievements = await this.prisma.achievement.findMany({
        include: { userAchievements: { where: { userId } } },
        orderBy: { createdAt: 'asc' },
      });
    }

    return achievements.map((a) => {
      const userAch = a.userAchievements[0];
      return {
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        rewardCoins: a.rewardCoins,
        unlocked: !!userAch,
        unlockedAt: userAch?.unlockedAt || null,
      };
    });
  }

  async checkAndUnlockAchievements(userId: string) {
    try {
      await this.getAchievements(userId);

      const [quizCount, perfectCount, challengeWins, user] = await Promise.all([
        this.prisma.quizSession.count({ where: { userId, isCompleted: true } }),
        this.prisma.quizSession.count({ where: { userId, isCompleted: true, score: { gte: 5 } } }),
        this.prisma.challenge.count({ where: { winnerId: userId } }),
        this.prisma.user.findUnique({ where: { id: userId } }),
      ]);

      const streak = user?.currentStreak || user?.longestStreak || 0;

      const keysToUnlock: string[] = [];
      if (quizCount >= 1) keysToUnlock.push('FIRST_QUIZ');
      if (perfectCount >= 1) keysToUnlock.push('PERFECT_SCORE');
      if (quizCount >= 10) keysToUnlock.push('QUIZ_10');
      if (challengeWins >= 1) keysToUnlock.push('CHALLENGE_WINNER');
      if (streak >= 3) keysToUnlock.push('STREAK_3');
      if (streak >= 7) keysToUnlock.push('STREAK_7');

      for (const key of keysToUnlock) {
        const ach = await this.prisma.achievement.findUnique({ where: { key } });
        if (!ach) continue;

        const already = await this.prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: ach.id,
            },
          },
        });

        if (!already) {
          await this.prisma.userAchievement.create({
            data: {
              userId,
              achievementId: ach.id,
            },
          });

          if (ach.rewardCoins > 0 && user) {
            await this.prisma.user.update({
              where: { id: userId },
              data: { coins: { increment: ach.rewardCoins } },
            });
            await this.prisma.walletTransaction.create({
              data: {
                userId,
                source: TransactionSource.QUIZ_REWARD,
                type: TransactionType.CREDIT,
                amount: ach.rewardCoins,
                status: TransactionStatus.COMPLETED,
                description: `Achievement unlocked: ${ach.title}`,
                balanceBefore: user.coins,
                balanceAfter: user.coins + ach.rewardCoins,
              },
            });
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to check/unlock achievements for ${userId}: ${err.message}`);
    }
  }
}
