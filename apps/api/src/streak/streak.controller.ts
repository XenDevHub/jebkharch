import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StreakService } from './streak.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('streak')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current user streak status and rewards schedule' })
  getStreakStatus(@CurrentUser('id') userId: string) {
    return this.streakService.getStreakStatus(userId);
  }

  @Post('claim')
  @ApiOperation({ summary: 'Claim daily streak reward' })
  claimDailyStreak(@CurrentUser('id') userId: string) {
    return this.streakService.claimDailyStreak(userId);
  }

  @Post('buy-freeze')
  @ApiOperation({ summary: 'Buy a streak freeze using coins' })
  buyStreakFreeze(@CurrentUser('id') userId: string) {
    return this.streakService.buyStreakFreeze(userId);
  }
}
