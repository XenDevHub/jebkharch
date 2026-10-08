import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  getTeams() {
    return this.teamService.getTeams();
  }

  @Post()
  createTeam(@Request() req: any, @Body() body: { name: string; description?: string }) {
    return this.teamService.createTeam(req.user.id, body.name, body.description);
  }

  @Post(':id/join')
  joinTeam(@Request() req: any, @Param('id') teamId: string) {
    return this.teamService.joinTeam(req.user.id, teamId);
  }

  @Post('leave')
  leaveTeam(@Request() req: any) {
    return this.teamService.leaveTeam(req.user.id);
  }
}
