import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async getTeams() {
    const teams = await this.prisma.team.findMany({
      orderBy: [
        { isVerified: 'desc' },
        { score: 'desc' },
      ],
      include: {
        _count: { select: { members: true } }
      }
    });
    return { data: teams };
  }

  async createTeam(userId: string, name: string, description?: string, isVerified = false, badge?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isAdmin = user.role === UserRole.ADMIN;

    if (!isAdmin && user.teamId) {
      throw new BadRequestException('You are already in a team. Leave it first.');
    }

    const exists = await this.prisma.team.findUnique({ where: { name } });
    if (exists) {
      throw new BadRequestException('Team name already taken.');
    }

    // Only Admin can create verified teams with badges
    const verifiedStatus = isAdmin ? (isVerified ?? true) : false;
    const badgeText = isAdmin ? (badge || (verifiedStatus ? 'OFFICIAL' : null)) : null;

    const createData: any = {
      id: uuidv4(),
      name,
      description,
      isVerified: verifiedStatus,
      badge: badgeText,
    };

    // If not admin or if admin has no team, connect user as first member
    if (!isAdmin || !user.teamId) {
      createData.members = {
        connect: { id: userId }
      };
    }

    const team = await this.prisma.team.create({
      data: createData,
      include: {
        _count: { select: { members: true } }
      }
    });

    return { message: 'Team created successfully', data: team };
  }

  async toggleVerifyTeam(adminUserId: string, teamId: string, isVerified?: boolean, badge?: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required.');
    }

    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const nextVerified = typeof isVerified === 'boolean' ? isVerified : !team.isVerified;
    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        isVerified: nextVerified,
        badge: nextVerified ? (badge || team.badge || 'OFFICIAL') : null,
      },
    });

    return { message: `Team is now ${nextVerified ? 'Verified' : 'Unverified'}`, data: updated };
  }

  async joinTeam(userId: string, teamId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.teamId) {
      throw new BadRequestException('You are already in a team. Leave it first.');
    }

    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId }
    });

    return { message: 'Joined team successfully' };
  }

  async leaveTeam(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId: null }
    });

    return { message: 'Left team successfully' };
  }
}
