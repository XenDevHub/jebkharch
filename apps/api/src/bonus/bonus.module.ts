import { Module } from '@nestjs/common';
import { BonusController } from './bonus.controller';
import { BonusService } from './bonus.service';

@Module({
  controllers: [BonusController],
  providers: [BonusService],
})
export class BonusModule {}
