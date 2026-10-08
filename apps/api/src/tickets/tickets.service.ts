import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async getTicketBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tournamentTickets: true },
    });

    if (!user) throw new NotFoundException('User not found');
    return { tournamentTickets: user.tournamentTickets };
  }

  async claimFreeDailyTicket(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingClaim = await this.prisma.tournamentTicketLog.findFirst({
      where: {
        userId,
        source: 'ADMIN_GRANT' as any, // fallback source
        createdAt: { gte: today },
      },
    });

    if (existingClaim) {
      throw new BadRequestException('Free daily ticket already claimed today');
    }

    await this.prisma.$transaction([
      this.prisma.tournamentTicketLog.create({
        data: {
          userId,
          source: 'ADMIN_GRANT' as any,
          amount: 1,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { tournamentTickets: { increment: 1 } },
      }),
    ]);

    return { message: 'Free daily ticket claimed successfully' };
  }

  async buyTicket(userId: string, source: 'BOUGHT_COINS' | 'REWARDED_AD' = 'BOUGHT_COINS') {
    const ticketCost = 500; // 500 coins for a ticket

    if (source === 'BOUGHT_COINS') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true },
      });

      if (!user) throw new NotFoundException('User not found');
      if (user.coins < ticketCost) {
        throw new BadRequestException(`Insufficient coins. Required: ${ticketCost}`);
      }

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: { decrement: ticketCost },
            tournamentTickets: { increment: 1 },
          },
        }),
        this.prisma.walletTransaction.create({
          data: {
            userId,
            source: 'QUIZ_ENTRY' as any, // using QUIZ_ENTRY as fallback
            type: 'DEBIT',
            amount: ticketCost,
            description: 'Bought tournament ticket',
            balanceBefore: user.coins,
            balanceAfter: user.coins - ticketCost,
          },
        }),
        this.prisma.tournamentTicketLog.create({
          data: {
            userId,
            source: 'PURCHASE' as any,
            amount: 1,
          },
        }),
      ]);
    } else {
      // REWARDED_AD
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { tournamentTickets: { increment: 1 } },
        }),
        this.prisma.tournamentTicketLog.create({
          data: {
            userId,
            source: 'ADMIN_GRANT' as any,
            amount: 1,
          },
        }),
      ]);
    }

    return { message: 'Ticket purchased/acquired successfully' };
  }
}
