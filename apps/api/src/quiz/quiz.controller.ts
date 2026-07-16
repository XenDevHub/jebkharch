import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsIn, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StartQuizDto {
  @ApiProperty() @IsString() categoryId: string;
}
class AnswerDto {
  @ApiProperty() @IsString() sessionId: string;
  @ApiProperty() @IsString() questionId: string;
  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] }) @IsIn(['A', 'B', 'C', 'D']) selectedAnswer: string;
  @ApiProperty({ minimum: 0, maximum: 15 }) @IsInt() @Min(0) @Max(15) timeTaken: number;
}
class FinishQuizDto {
  @ApiProperty() @IsString() sessionId: string;
}

@ApiTags('quiz')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all quiz categories' })
  getCategories(@CurrentUser('id') userId: string) {
    return this.quizService.getCategories(userId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a new quiz session (deducts entry fee)' })
  startQuiz(@CurrentUser('id') userId: string, @Body() dto: StartQuizDto) {
    return this.quizService.startQuiz(userId, dto.categoryId);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Submit answer for a question in active session' })
  answer(@CurrentUser('id') userId: string, @Body() dto: AnswerDto) {
    return this.quizService.submitAnswer(userId, dto.sessionId, dto.questionId, dto.selectedAnswer, dto.timeTaken);
  }

  @Post('finish')
  @ApiOperation({ summary: 'Finish quiz session — calculates and awards coins' })
  finish(@CurrentUser('id') userId: string, @Body() dto: FinishQuizDto) {
    return this.quizService.finishQuiz(userId, dto.sessionId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get quiz play history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  history(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.quizService.getHistory(userId, +page, +pageSize);
  }
}
