import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WithdrawalStatus } from '@prisma/client';
import { Difficulty } from '@jebkharch/shared';

class BanUserDto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() reason: string;
}
class WithdrawalActionDto {
  @ApiProperty() @IsString() withdrawalId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
class GenerateQuestionsDto {
  @ApiProperty() @IsString() categoryId: string;
  @ApiProperty({ minimum: 1, maximum: 50 }) @IsInt() @Min(1) @Max(50) count: number;
  @ApiProperty({ enum: Difficulty }) @IsEnum(Difficulty) difficulty: Difficulty;
}
class ModerateQuestionDto {
  @ApiProperty() @IsString() questionId: string;
  @ApiProperty() approve: boolean;
}

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: '[ADMIN] List all users with fraud scores' })
  @ApiQuery({ name: 'search', required: false })
  getUsers(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(+page, +pageSize, search);
  }

  @Post('ban-user')
  @ApiOperation({ summary: '[ADMIN] Ban a user account' })
  banUser(@CurrentUser('id') adminId: string, @Body() dto: BanUserDto) {
    return this.adminService.banUser(adminId, dto.userId, dto.reason);
  }

  @Post('unban-user')
  @ApiOperation({ summary: '[ADMIN] Unban a user account' })
  unbanUser(@CurrentUser('id') adminId: string, @Body() dto: { userId: string }) {
    return this.adminService.unbanUser(adminId, dto.userId);
  }

  // ── Withdrawals ───────────────────────────────────────────────────────────

  @Get('withdrawals')
  @ApiOperation({ summary: '[ADMIN] Get withdrawal queue' })
  @ApiQuery({ name: 'status', enum: WithdrawalStatus, required: false })
  getWithdrawals(
    @Query('status') status?: WithdrawalStatus,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.adminService.getWithdrawals(status, +page, +pageSize);
  }

  @Post('approve-withdrawal')
  @ApiOperation({ summary: '[ADMIN] Approve a withdrawal — triggers Easypaisa payout' })
  approveWithdrawal(@CurrentUser('id') adminId: string, @Body() dto: WithdrawalActionDto) {
    return this.adminService.approveWithdrawal(adminId, dto.withdrawalId);
  }

  @Post('reject-withdrawal')
  @ApiOperation({ summary: '[ADMIN] Reject a withdrawal — coins refunded to user' })
  rejectWithdrawal(@CurrentUser('id') adminId: string, @Body() dto: WithdrawalActionDto) {
    return this.adminService.rejectWithdrawal(adminId, dto.withdrawalId, dto.reason || 'Rejected by admin');
  }

  // ── Quiz Management ───────────────────────────────────────────────────────

  @Post('generate-questions')
  @ApiOperation({ summary: '[ADMIN] Trigger AI question generation for a category' })
  generateQuestions(@Body() dto: GenerateQuestionsDto) {
    return this.adminService.generateQuestions(dto.categoryId, dto.count, dto.difficulty);
  }

  @Get('flagged-questions')
  @ApiOperation({ summary: '[ADMIN] Get flagged/unapproved questions for moderation' })
  getFlaggedQuestions(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.adminService.getFlaggedQuestions(+page, +pageSize);
  }

  @Post('moderate-question')
  @ApiOperation({ summary: '[ADMIN] Approve or reject a question' })
  moderateQuestion(@Body() dto: ModerateQuestionDto) {
    return this.adminService.moderateQuestion(dto.questionId, dto.approve);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get('analytics')
  @ApiOperation({ summary: '[ADMIN] Get platform analytics dashboard' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
