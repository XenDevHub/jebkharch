import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { QuizModule } from '../quiz/quiz.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [QuizModule, NotificationModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
