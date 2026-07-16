import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdType } from '@prisma/client';
import { Request } from 'express';

class RecordAdDto {
  @ApiProperty({ enum: AdType }) @IsEnum(AdType) adType: AdType;
  @ApiPropertyOptional() @IsOptional() @IsString() deviceId?: string;
}

@ApiTags('ads')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post('watch')
  @ApiOperation({ summary: 'Record an ad watch — earn 1-3 coins for REWARDED ads (max 10/day)' })
  watch(@CurrentUser('id') userId: string, @Body() dto: RecordAdDto, @Req() req: Request) {
    return this.adsService.recordAdWatch(userId, dto.adType, dto.deviceId, req.ip);
  }
}
