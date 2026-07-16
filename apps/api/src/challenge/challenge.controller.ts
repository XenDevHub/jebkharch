import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateChallengeDto {
  @ApiProperty() @IsString() categoryId: string;
}
class JoinByCodeDto {
  @ApiProperty() @IsString() inviteCode: string;
}
class SubmitResultDto {
  @ApiProperty() @IsString() challengeId: string;
  @ApiProperty({ minimum: 0, maximum: 10 }) @IsInt() @Min(0) @Max(10) score: number;
}

@ApiTags('challenge')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a 1v1 challenge — generates invite link' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateChallengeDto) {
    return this.challengeService.createChallenge(userId, dto.categoryId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a challenge by invite code' })
  joinByCode(@CurrentUser('id') userId: string, @Body() dto: JoinByCodeDto) {
    return this.challengeService.joinByCode(userId, dto.inviteCode);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit your score for an active challenge' })
  submit(@CurrentUser('id') userId: string, @Body() dto: SubmitResultDto) {
    return this.challengeService.submitResult(userId, dto.challengeId, dto.score);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get challenge history' })
  history(@CurrentUser('id') userId: string) {
    return this.challengeService.getHistory(userId);
  }
}
