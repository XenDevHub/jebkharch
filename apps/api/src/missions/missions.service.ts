import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MissionsService {
  constructor(private prisma: PrismaService) {}

  async getMissions(userId: string) {
    let userMissions = await this.prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { assignedAt: 'desc' },
    });

    if (userMissions.length === 0) {
      // Need to find active missions or create some defaults
      let missions = await this.prisma.mission.findMany({
        where: { isActive: true },
        take: 3,
      });

      if (missions.length === 0) {
        // Seed default missions
        await this.prisma.mission.createMany({
          data: [
            { title: 'Daily Quiz Master', description: 'Play 3 quiz matches today', type: 'DAILY', targetValue: 3, rewardCoins: 50, rewardTickets: 0 },
            { title: 'Perfect Score', description: 'Get 5 correct answers in a row', type: 'DAILY', targetValue: 5, rewardCoins: 100, rewardTickets: 1 },
            { title: 'Weekly Champion', description: 'Win 10 tournament or challenge matches', type: 'WEEKLY', targetValue: 10, rewardCoins: 300, rewardTickets: 2 },
          ],
        });
        missions = await this.prisma.mission.findMany({ take: 3 });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      await this.prisma.userMission.createMany({
        data: missions.map(m => ({
          userId,
          missionId: m.id,
          progress: 0,
          status: 'ACTIVE',
          expiresAt,
        })),
      });

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
          source: 'DAILY_LOGIN' as any, // or some other source, schema doesn't have MISSION_REWARD
          type: 'CREDIT',
          amount: userMission.mission.rewardCoins,
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

  async getAchievements(userId: string) {
    let achievements = await this.prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
        },
      },
    });

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
}
