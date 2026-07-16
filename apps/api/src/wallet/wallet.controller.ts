import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class WithdrawDto {
  @ApiProperty({ example: '03001234567' })
  @IsString()
  @Matches(/^03\d{9}$/, { message: 'Invalid Easypaisa number' })
  easypaisaNumber: string;

  @ApiProperty({ example: 500, description: 'Minimum 500 coins' })
  @IsInt()
  @Min(500)
  coins: number;
}

@ApiTags('wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet summary (balance, today earned, pending)' })
  getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request Easypaisa withdrawal (min 500 coins, 24h cooldown)' })
  withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
    return this.walletService.requestWithdrawal(userId, dto.easypaisaNumber, dto.coins);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get full transaction history' })
  transactions(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.walletService.getTransactions(userId, +page, +pageSize);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get withdrawal history' })
  withdrawalHistory(@CurrentUser('id') userId: string) {
    return this.walletService.getWithdrawalHistory(userId);
  }
}
