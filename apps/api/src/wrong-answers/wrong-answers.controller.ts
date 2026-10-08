import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { WrongAnswersService } from './wrong-answers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsIn } from 'class-validator';

class SaveWrongAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  @IsIn(['A', 'B', 'C', 'D'])
  selectedAnswer: string;
}

@ApiTags('wrong-answers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wrong-answers')
export class WrongAnswersController {
  constructor(private readonly wrongAnswersService: WrongAnswersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current wrong answers bank' })
  getWrongAnswers(@CurrentUser('id') userId: string) {
    return this.wrongAnswersService.getWrongAnswers(userId);
  }

  @Get('mastered')
  @ApiOperation({ summary: 'Get mastered answers history' })
  getMasteredAnswers(@CurrentUser('id') userId: string) {
    return this.wrongAnswersService.getMasteredAnswers(userId);
  }

  @Post('save')
  @ApiOperation({ summary: 'Save a wrong answer from quiz' })
  saveWrongAnswer(@CurrentUser('id') userId: string, @Body() dto: SaveWrongAnswerDto) {
    return this.wrongAnswersService.saveWrongAnswer(userId, dto.questionId, dto.selectedAnswer);
  }

  @Post(':id/master')
  @ApiOperation({ summary: 'Mark a wrong answer as mastered' })
  markAsMastered(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.wrongAnswersService.markAsMastered(userId, id);
  }
}
