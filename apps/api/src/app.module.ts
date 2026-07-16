import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { WalletModule } from './wallet/wallet.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ReferralModule } from './referral/referral.module';
import { AdminModule } from './admin/admin.module';
import { AdsModule } from './ads/ads.module';
import { FraudModule } from './fraud/fraud.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // ── Config ───────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // ── Rate Limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,     // 1 second
        limit: 10,     // max 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,    // 1 minute
        limit: 100,
      },
    ]),

    // ── Core ──────────────────────────────────────────────────────────────
    PrismaModule,
    StorageModule,

    // ── Feature Modules ───────────────────────────────────────────────────
    AuthModule,
    UserModule,
    QuizModule,
    WalletModule,
    ChallengeModule,
    ReferralModule,
    AdsModule,
    FraudModule,

    // ── Admin ─────────────────────────────────────────────────────────────
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
