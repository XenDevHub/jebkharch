import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WrongAnswersService {
  constructor(private prisma: PrismaService) {}

  async getWrongAnswers(userId: string) {
    return this.prisma.wrongAnswer.findMany({
      where: { userId, masteredAt: null },
      include: {
        question: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMasteredAnswers(userId: string) {
    return this.prisma.wrongAnswer.findMany({
      where: { userId, masteredAt: { not: null } },
      include: {
        question: true,
      },
      orderBy: { masteredAt: 'desc' },
    });
  }

  async markAsMastered(userId: string, wrongAnswerId: string) {
    const wrongAnswer = await this.prisma.wrongAnswer.findFirst({
      where: { id: wrongAnswerId, userId },
    });

    if (!wrongAnswer) throw new NotFoundException('Wrong answer not found');

    await this.prisma.wrongAnswer.update({
      where: { id: wrongAnswerId },
      data: { masteredAt: new Date() },
    });

    return { message: 'Question marked as mastered!' };
  }

  async saveWrongAnswer(userId: string, questionId: string, selectedAnswer: string) {
    const existing = await this.prisma.wrongAnswer.findFirst({
      where: { userId, questionId },
    });

    if (existing) {
      return this.prisma.wrongAnswer.update({
        where: { id: existing.id },
        data: {
          practiceCount: { increment: 1 },
          masteredAt: null, // If they get it wrong again, un-master it
        },
      });
    }

    return this.prisma.wrongAnswer.create({
      data: {
        userId,
        questionId,
      },
    });
  }
}
