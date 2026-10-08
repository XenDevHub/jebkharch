import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bonus')
@UseGuards(JwtAuthGuard)
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get('lives')
  getLives(@Request() req: any) {
    return this.bonusService.getLives(req.user.id);
  }

  @Post('spin')
  spinWheel(@Request() req: any) {
    return this.bonusService.spinWheel(req.user.id);
  }

  @Post('watch-ad')
  watchAd(@Request() req: any, @Body() body: { adType: string; rewardType: 'coins' | 'life' }) {
    return this.bonusService.watchAd(req.user.id, body.adType, body.rewardType);
  }
}
