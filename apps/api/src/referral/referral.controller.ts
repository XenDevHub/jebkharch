import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApplyReferralDto {
  @ApiProperty() @IsString() referralCode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deviceId?: string;
}

@ApiTags('referral')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  @ApiOperation({ summary: 'Get my referral code and stats' })
  getCode(@CurrentUser('id') userId: string) {
    return this.referralService.getMyCode(userId);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a friend\'s referral code (post-signup)' })
  apply(@CurrentUser('id') userId: string, @Body() dto: ApplyReferralDto) {
    return this.referralService.applyReferralCode(userId, dto.referralCode, dto.deviceId);
  }
}
