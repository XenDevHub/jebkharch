import { Module } from '@nestjs/common';
import { WrongAnswersService } from './wrong-answers.service';
import { WrongAnswersController } from './wrong-answers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WrongAnswersService],
  controllers: [WrongAnswersController],
  exports: [WrongAnswersService],
})
export class WrongAnswersModule {}
