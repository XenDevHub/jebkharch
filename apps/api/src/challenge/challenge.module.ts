import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { ChallengeGateway } from './challenge.gateway';
import { AuthModule } from '../auth/auth.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [AuthModule, MissionsModule],
  controllers: [ChallengeController],
  providers: [ChallengeService, ChallengeGateway],
  exports: [ChallengeService],
})
export class ChallengeModule {}
