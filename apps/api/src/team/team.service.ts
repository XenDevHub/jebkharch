import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async getTeams() {
    const teams = await this.prisma.team.findMany({
      orderBy: { score: 'desc' },
      include: {
        _count: { select: { members: true } }
      }
    });
    return { data: teams };
  }

  async createTeam(userId: string, name: string, description?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.teamId) {
      throw new BadRequestException('You are already in a team. Leave it first.');
    }

    const exists = await this.prisma.team.findUnique({ where: { name } });
    if (exists) {
      throw new BadRequestException('Team name already taken.');
    }

    const team = await this.prisma.team.create({
      data: {
        id: uuidv4(),
        name,
        description,
        members: {
          connect: { id: userId }
        }
      }
    });

    return { message: 'Team created successfully', data: team };
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
