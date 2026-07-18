import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeGateway } from './challenge.gateway';
import { COIN_CONSTANTS, TransactionSource, SocketEvent } from '@jebkharch/shared';
import { v4 as uuidv4 } from 'uuid';
import { ChallengeStatus, TransactionType, TransactionStatus } from '@prisma/client';
import dayjs from 'dayjs';

const CHALLENGE_LOBBY_EXPIRY_MINUTES = 5;
const CHALLENGE_QUESTIONS = 10;

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ChallengeGateway,
  ) {}

  // ── Create Challenge ──────────────────────────────────────────────────────

  async createChallenge(creatorId: string, categoryId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: creatorId } });
    if (!user) throw new NotFoundException('User not found.');

    if (user.coins < COIN_CONSTANTS.CHALLENGE_ENTRY) {
      throw new BadRequestException(`Need ${COIN_CONSTANTS.CHALLENGE_ENTRY} coins to create a challenge.`);
    }

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found.');

    const inviteCode = this.generateInviteCode();
    const expiresAt = dayjs().add(CHALLENGE_LOBBY_EXPIRY_MINUTES, 'minute').toDate();

    // Deduct entry fee atomically
    const challenge = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: creatorId },
        data: { coins: { decrement: COIN_CONSTANTS.CHALLENGE_ENTRY } },
      });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId: creatorId,
          type: TransactionType.DEBIT,
          amount: COIN_CONSTANTS.CHALLENGE_ENTRY,
          source: TransactionSource.CHALLENGE_ENTRY as any,
          status: TransactionStatus.COMPLETED,
          balanceBefore: user.coins,
          balanceAfter: user.coins - COIN_CONSTANTS.CHALLENGE_ENTRY,
          description: `Challenge entry: ${category.name}`,
        },
      });

      return tx.challenge.create({
        data: {
          id: uuidv4(),
          creatorId,
          categoryId,
          potAmount: COIN_CONSTANTS.CHALLENGE_WIN_POT,
          inviteCode,
          expiresAt,
          status: ChallengeStatus.PENDING,
        },
      });
    });

    return {
      challengeId: challenge.id,
      inviteCode,
      categoryName: category.name,
      potAmount: COIN_CONSTANTS.CHALLENGE_WIN_POT,
      expiresAt,
      shareLink: `jebkharch://challenge/${inviteCode}`,
    };
  }

  // ── Join Challenge ────────────────────────────────────────────────────────

  async joinChallenge(opponentId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { category: true },
    });

    if (!challenge) throw new NotFoundException('Challenge not found.');
    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('This challenge is no longer available to join.');
    }
    if (challenge.creatorId === opponentId) {
      throw new BadRequestException('You cannot join your own challenge.');
    }
    if (dayjs().isAfter(dayjs(challenge.expiresAt))) {
      await this.prisma.challenge.update({ where: { id: challengeId }, data: { status: ChallengeStatus.EXPIRED } });
      throw new BadRequestException('This challenge lobby has expired.');
    }

    const opponent = await this.prisma.user.findUnique({ where: { id: opponentId } });
    if (!opponent) throw new NotFoundException('User not found.');
    if (opponent.coins < COIN_CONSTANTS.CHALLENGE_ENTRY) {
      throw new BadRequestException(`Need ${COIN_CONSTANTS.CHALLENGE_ENTRY} coins to join a challenge.`);
    }

    // Deduct opponent entry fee + activate challenge
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: opponentId },
        data: { coins: { decrement: COIN_CONSTANTS.CHALLENGE_ENTRY } },
      });

      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId: opponentId,
          type: TransactionType.DEBIT,
          amount: COIN_CONSTANTS.CHALLENGE_ENTRY,
          source: TransactionSource.CHALLENGE_ENTRY as any,
          status: TransactionStatus.COMPLETED,
          balanceBefore: opponent.coins,
          balanceAfter: opponent.coins - COIN_CONSTANTS.CHALLENGE_ENTRY,
          description: `Challenge entry: ${challenge.category.name}`,
        },
      });

      await tx.challenge.update({
        where: { id: challengeId },
        data: {
          opponentId,
          status: ChallengeStatus.ACTIVE,
          startedAt: new Date(),
        },
      });
    });

    // Notify both players via WebSocket
    this.gateway.notifyChallengeStarted(challengeId, challenge.creatorId, opponentId);

    return { message: 'Challenge joined! Get ready to play.', challengeId };
  }

  // ── Join by Invite Code ───────────────────────────────────────────────────

  async joinByCode(opponentId: string, inviteCode: string) {
    const challenge = await this.prisma.challenge.findFirst({
      where: { inviteCode: inviteCode.toUpperCase() },
    });
    if (!challenge) throw new NotFoundException('Invalid invite code.');
    return this.joinChallenge(opponentId, challenge.id);
  }

  // ── Submit Challenge Result ───────────────────────────────────────────────

  async submitResult(userId: string, challengeId: string, score: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { category: true },
    });

    if (!challenge) throw new NotFoundException('Challenge not found.');
    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new BadRequestException('Challenge is not in active state.');
    }
    if (challenge.creatorId !== userId && challenge.opponentId !== userId) {
      throw new ForbiddenException('You are not a participant in this challenge.');
    }

    const isCreator = challenge.creatorId === userId;

    // Store score
    await this.prisma.challenge.update({
      where: { id: challengeId },
      data: isCreator ? { creatorScore: score } : { opponentScore: score },
    });

    // Check if both scores are in
    const updated = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    const bothSubmitted = updated!.creatorScore !== null && updated!.opponentScore !== null;

    if (bothSubmitted) {
      await this.resolveChallenge(challengeId, updated!);
    }

    return { message: 'Score submitted.', waiting: !bothSubmitted };
  }

  // ── Resolve Challenge (determine winner) ─────────────────────────────────

  private async resolveChallenge(challengeId: string, challenge: any) {
    const { creatorId, opponentId, creatorScore, opponentScore } = challenge;
    const isTie = creatorScore === opponentScore;

    let winnerId: string | null = null;
    let loserId: string | null = null;

    if (!isTie) {
      winnerId = creatorScore > opponentScore ? creatorId : opponentId;
      loserId = winnerId === creatorId ? opponentId : creatorId;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.challenge.update({
        where: { id: challengeId },
        data: {
          status: ChallengeStatus.COMPLETED,
          winnerId,
          completedAt: new Date(),
        },
      });

      if (isTie) {
        // Refund both players
        for (const playerId of [creatorId, opponentId]) {
          const player = await tx.user.findUnique({ where: { id: playerId }, select: { coins: true } });
          await tx.user.update({
            where: { id: playerId },
            data: { coins: { increment: COIN_CONSTANTS.CHALLENGE_ENTRY } },
          });
          await tx.walletTransaction.create({
            data: {
              id: uuidv4(),
              userId: playerId,
              type: TransactionType.CREDIT,
              amount: COIN_CONSTANTS.CHALLENGE_ENTRY,
              source: TransactionSource.CHALLENGE_REFUND as any,
              status: TransactionStatus.COMPLETED,
              referenceId: challengeId,
              balanceBefore: player!.coins,
              balanceAfter: player!.coins + COIN_CONSTANTS.CHALLENGE_ENTRY,
              description: 'Challenge tie — entry fee refunded',
            },
          });
        }
      } else {
        // Winner takes the pot
        const winner = await tx.user.findUnique({ where: { id: winnerId! }, select: { coins: true } });
        await tx.user.update({
          where: { id: winnerId! },
          data: {
            coins: { increment: COIN_CONSTANTS.CHALLENGE_WIN_POT },
            xp: { increment: 50 },
          },
        });
        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId: winnerId!,
            type: TransactionType.CREDIT,
            amount: COIN_CONSTANTS.CHALLENGE_WIN_POT,
            source: TransactionSource.CHALLENGE_WIN as any,
            status: TransactionStatus.COMPLETED,
            referenceId: challengeId,
            balanceBefore: winner!.coins,
            balanceAfter: winner!.coins + COIN_CONSTANTS.CHALLENGE_WIN_POT,
            description: 'Challenge win — you beat your opponent!',
          },
        });
      }
    });

    // Notify both players
    this.gateway.notifyChallengeCompleted(challengeId, {
      winnerId,
      isTie,
      creatorScore,
      opponentScore,
    });
  }

  // ── Challenge History ─────────────────────────────────────────────────────

  async getHistory(userId: string) {
    return this.prisma.challenge.findMany({
      where: {
        OR: [{ creatorId: userId }, { opponentId: userId }],
        status: ChallengeStatus.COMPLETED,
      },
      include: { category: true },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
