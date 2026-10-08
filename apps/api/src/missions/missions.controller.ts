import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('missions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user missions' })
  getMissions(@CurrentUser('id') userId: string) {
    return this.missionsService.getMissions(userId);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim mission reward' })
  claimMission(@CurrentUser('id') userId: string, @Param('id') missionId: string) {
    return this.missionsService.claimMission(userId, missionId);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements' })
  getAchievements(@CurrentUser('id') userId: string) {
    return this.missionsService.getAchievements(userId);
  }
}
