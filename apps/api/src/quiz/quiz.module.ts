import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MissionsModule } from '../missions/missions.module';
import { StreakModule } from '../streak/streak.module';

@Module({
  imports: [MissionsModule, StreakModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
