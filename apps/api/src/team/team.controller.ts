import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('teams')
@ApiBearerAuth('access-token')
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clans & teams sorted by verified and score' })
  getTeams() {
    return this.teamService.getTeams();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new team (Admins can create verified official teams)' })
  createTeam(@Request() req: any, @Body() body: { name: string; description?: string; isVerified?: boolean; badge?: string }) {
    return this.teamService.createTeam(req.user.id, body.name, body.description, body.isVerified, body.badge);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: '[ADMIN] Toggle team verified status' })
  verifyTeam(@Request() req: any, @Param('id') teamId: string, @Body() body: { isVerified?: boolean; badge?: string }) {
    return this.teamService.toggleVerifyTeam(req.user.id, teamId, body?.isVerified, body?.badge);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a clan' })
  joinTeam(@Request() req: any, @Param('id') teamId: string) {
    return this.teamService.joinTeam(req.user.id, teamId);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Leave current clan' })
  leaveTeam(@Request() req: any) {
    return this.teamService.leaveTeam(req.user.id);
  }
}
