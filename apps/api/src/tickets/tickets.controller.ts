import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsIn } from 'class-validator';

class BuyTicketDto {
  @ApiProperty({ enum: ['BOUGHT_COINS', 'REWARDED_AD'] })
  @IsIn(['BOUGHT_COINS', 'REWARDED_AD'])
  source: 'BOUGHT_COINS' | 'REWARDED_AD';
}

@ApiTags('tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current ticket balance' })
  getTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.getTicketBalance(userId);
  }

  @Post('claim-daily')
  @ApiOperation({ summary: 'Claim free daily ticket' })
  claimFreeDailyTicket(@CurrentUser('id') userId: string) {
    return this.ticketsService.claimFreeDailyTicket(userId);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Buy a tournament ticket using coins or rewarded ad' })
  buyTicket(@CurrentUser('id') userId: string, @Body() dto: BuyTicketDto) {
    return this.ticketsService.buyTicket(userId, dto.source);
  }
}
