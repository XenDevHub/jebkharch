import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ISmsProvider, SMS_PROVIDER } from '../sms/interfaces/sms-provider.interface';
import { OtpPurpose, COIN_CONSTANTS, OTP_CONSTANTS } from '@jebkharch/shared';
import { CreateProfileDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionSource, TransactionType, TransactionStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: ISmsProvider,
  ) {}

  // ── Generate OTP ─────────────────────────────────────────────────────────

  async sendOtp(dto: SendOtpDto, ipAddress?: string): Promise<{ message: string; cooldownSeconds: number }> {
    const { phone, purpose } = dto;

    // Normalize phone
    const normalizedPhone = this.normalizePhone(phone);

    // Check OTP spam: if too many failed recent OTPs, block
    const recentFailedOtps = await this.prisma.otpVerification.count({
      where: {
        phone: normalizedPhone,
        createdAt: { gte: dayjs().subtract(10, 'minute').toDate() },
        verified: false,
        attempts: { gte: OTP_CONSTANTS.MAX_ATTEMPTS },
      },
    });

    if (recentFailedOtps > 0) {
      this.logger.warn(`OTP spam detected for phone ${normalizedPhone}`);
      throw new ForbiddenException('Too many failed OTP attempts. Please try again after 10 minutes.');
    }

    // Check resend cooldown
    const lastOtp = await this.prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, verified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const secondsSinceLastOtp = dayjs().diff(dayjs(lastOtp.createdAt), 'second');
      if (secondsSinceLastOtp < OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS) {
        const remaining = OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp;
        throw new BadRequestException(`Please wait ${remaining} seconds before requesting a new OTP.`);
      }
    }

    // Generate OTP
    const otpCode = this.generateOtp();
    const expiresAt = dayjs().add(OTP_CONSTANTS.EXPIRY_SECONDS, 'second').toDate();

    await this.prisma.otpVerification.create({
      data: {
        id: uuidv4(),
        phone: normalizedPhone,
        otpCode,
        purpose,
        expiresAt,
        ipAddress,
      },
    });

    // Send SMS (stubbed in dev)
    await this.smsProvider.sendOtp(normalizedPhone, otpCode);

    return {
      message: 'OTP sent successfully.',
      cooldownSeconds: OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS,
    };
  }

  // ── Verify OTP ───────────────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto): Promise<{ verified: boolean; isNewUser: boolean }> {
    const { phone, otpCode, purpose } = dto;
    const normalizedPhone = this.normalizePhone(phone);

    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('No pending OTP found. Please request a new one.');
    }

    // Check expiry
    if (dayjs().isAfter(dayjs(otpRecord.expiresAt))) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
      throw new ForbiddenException('Too many incorrect attempts. Please request a new OTP.');
    }

    // DEV MODE: Accept "123456" as magic OTP
    const isDevMode = this.config.get('NODE_ENV') === 'development';
    const isCorrect = isDevMode
      ? otpCode === '123456' || otpCode === otpRecord.otpCode
      : otpCode === otpRecord.otpCode;

    if (!isCorrect) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const attemptsLeft = OTP_CONSTANTS.MAX_ATTEMPTS - otpRecord.attempts - 1;
      throw new BadRequestException(`Invalid OTP. ${attemptsLeft} attempts remaining.`);
    }

    // Mark as verified
    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { phone: normalizedPhone } });

    return {
      verified: true,
      isNewUser: !existingUser,
    };
  }

  // ── Create Profile (Registration) ─────────────────────────────────────────

  async createProfile(dto: CreateProfileDto, ipAddress?: string) {
    const normalizedPhone = this.normalizePhone(dto.phone);

    // Confirm OTP was verified
    const verifiedOtp = await this.prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.REGISTER,
        verified: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also accept LOGIN purpose for the registration flow (verify-then-create-profile path)
    const verifiedLoginOtp = await this.prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verified: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verifiedOtp && !verifiedLoginOtp) {
      throw new UnauthorizedException('Phone not verified. Please complete OTP verification first.');
    }

    // Check phone not already registered
    const existing = await this.prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (existing) {
      throw new ConflictException('An account already exists with this phone number. Please log in.');
    }

    // Validate referral code (if provided)
    let referrer: { id: string } | null = null;
    if (dto.referralCode) {
      referrer = await this.prisma.user.findFirst({
        where: { referralCode: dto.referralCode.toUpperCase() },
        select: { id: true },
      });
      if (!referrer) {
        throw new BadRequestException('Invalid referral code.');
      }

      // One device = one referral reward check
      if (dto.deviceId) {
        const existingReferralFromDevice = await this.prisma.referral.findFirst({
          where: { deviceId: dto.deviceId },
        });
        if (existingReferralFromDevice) {
          this.logger.warn(`Referral fraud attempt from device ${dto.deviceId}`);
          referrer = null; // Don't apply referral reward but still allow signup
        }
      }
    }

    // Generate unique referral code
    const referralCode = await this.generateUniqueReferralCode();

    // Create user + signup bonus + referral bonus atomically
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: uuidv4(),
          phone: normalizedPhone,
          name: dto.name,
          referralCode,
          referredBy: referrer?.id,
          coins: COIN_CONSTANTS.SIGNUP_BONUS,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        },
      });

      // Record signup bonus transaction
      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId: newUser.id,
          type: TransactionType.CREDIT,
          amount: COIN_CONSTANTS.SIGNUP_BONUS,
          source: TransactionSource.SIGNUP_BONUS,
          status: TransactionStatus.COMPLETED,
          balanceBefore: 0,
          balanceAfter: COIN_CONSTANTS.SIGNUP_BONUS,
          description: 'Welcome bonus — thanks for joining Jeb Kharch!',
        },
      });

      // Apply referral rewards
      if (referrer) {
        // Record referral
        await tx.referral.create({
          data: {
            id: uuidv4(),
            referrerId: referrer.id,
            referredUserId: newUser.id,
            rewardGiven: true,
            deviceId: dto.deviceId,
          },
        });

        // Give referral bonus to new user
        await tx.user.update({
          where: { id: newUser.id },
          data: { coins: { increment: COIN_CONSTANTS.REFERRAL_BONUS } },
        });
        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId: newUser.id,
            type: TransactionType.CREDIT,
            amount: COIN_CONSTANTS.REFERRAL_BONUS,
            source: TransactionSource.REFERRAL_BONUS,
            status: TransactionStatus.COMPLETED,
            balanceBefore: COIN_CONSTANTS.SIGNUP_BONUS,
            balanceAfter: COIN_CONSTANTS.SIGNUP_BONUS + COIN_CONSTANTS.REFERRAL_BONUS,
            description: 'Referral bonus — you used a friend\'s code!',
          },
        });

        // Give referral bonus to referrer
        const referrerUser = await tx.user.findUnique({ where: { id: referrer.id }, select: { coins: true } });
        await tx.user.update({
          where: { id: referrer.id },
          data: { coins: { increment: COIN_CONSTANTS.REFERRAL_BONUS } },
        });
        await tx.walletTransaction.create({
          data: {
            id: uuidv4(),
            userId: referrer.id,
            type: TransactionType.CREDIT,
            amount: COIN_CONSTANTS.REFERRAL_BONUS,
            source: TransactionSource.REFERRAL_BONUS,
            status: TransactionStatus.COMPLETED,
            balanceBefore: referrerUser?.coins || 0,
            balanceAfter: (referrerUser?.coins || 0) + COIN_CONSTANTS.REFERRAL_BONUS,
            description: `Referral bonus — your friend ${dto.name} joined!`,
          },
        });
      }

      // Create device session
      if (dto.deviceId) {
        await tx.deviceSession.upsert({
          where: { userId_deviceId: { userId: newUser.id, deviceId: dto.deviceId } },
          update: { isActive: true, lastSeenAt: new Date(), ipAddress },
          create: {
            id: uuidv4(),
            userId: newUser.id,
            deviceId: dto.deviceId,
            platform: dto.platform,
            deviceModel: dto.deviceModel,
            ipAddress,
            isActive: true,
          },
        });
      }

      return newUser;
    });

    // Issue tokens
    const tokens = await this.issueTokens(user.id, normalizedPhone, user.role);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        coins: user.coins + (referrer ? COIN_CONSTANTS.REFERRAL_BONUS : 0),
        referralCode: user.referralCode,
        isPro: user.isPro,
      },
      ...tokens,
    };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ipAddress?: string) {
    const normalizedPhone = this.normalizePhone(dto.phone);

    // Verify OTP first
    await this.verifyOtp({ phone: dto.phone, otpCode: dto.otpCode, purpose: OtpPurpose.LOGIN });

    const user = await this.prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (!user) {
      throw new UnauthorizedException('Account not found. Please register first.');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Your account has been suspended. Contact support.');
    }

    // Check daily login bonus
    await this.maybeGrantDailyLoginBonus(user.id, user.lastDailyBonusAt, user.coins);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    });

    // Update device session
    if (dto.deviceId) {
      await this.prisma.deviceSession.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId: dto.deviceId } },
        update: { isActive: true, lastSeenAt: new Date(), ipAddress },
        create: {
          id: uuidv4(),
          userId: user.id,
          deviceId: dto.deviceId,
          platform: dto.platform,
          deviceModel: dto.deviceModel,
          ipAddress,
          isActive: true,
        },
      });
    }

    const tokens = await this.issueTokens(user.id, normalizedPhone, user.role);
    const freshUser = await this.prisma.user.findUnique({ where: { id: user.id } });

    return {
      user: {
        id: freshUser!.id,
        phone: freshUser!.phone,
        name: freshUser!.name,
        coins: freshUser!.coins,
        referralCode: freshUser!.referralCode,
        isPro: freshUser!.isPro,
        role: freshUser!.role,
      },
      ...tokens,
    };
  }

  // ── Token Management ──────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.isBanned) {
        throw new UnauthorizedException('Invalid session.');
      }

      return this.issueTokens(user.id, user.phone, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizePhone(phone: string): string {
    // Normalize to 03XXXXXXXXX format
    let normalized = phone.replace(/\s|-/g, '');
    if (normalized.startsWith('+92')) normalized = '0' + normalized.slice(3);
    if (normalized.startsWith('0092')) normalized = '0' + normalized.slice(4);
    return normalized;
  }

  private async generateUniqueReferralCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = 'JEB' + Math.floor(10000 + Math.random() * 90000).toString();
      const exists = await this.prisma.user.findFirst({ where: { referralCode: code } });
      if (!exists) return code;
    }
    return 'JEB' + uuidv4().slice(0, 5).toUpperCase();
  }

  private async issueTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async maybeGrantDailyLoginBonus(userId: string, lastBonusAt: Date | null, currentCoins: number) {
    if (lastBonusAt && dayjs().isSame(dayjs(lastBonusAt), 'day')) {
      return; // already got today's bonus
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: COIN_CONSTANTS.DAILY_LOGIN_BONUS },
          lastDailyBonusAt: new Date(),
        },
      });
      await tx.walletTransaction.create({
        data: {
          id: uuidv4(),
          userId,
          type: TransactionType.CREDIT,
          amount: COIN_CONSTANTS.DAILY_LOGIN_BONUS,
          source: TransactionSource.DAILY_LOGIN,
          status: TransactionStatus.COMPLETED,
          balanceBefore: currentCoins,
          balanceAfter: currentCoins + COIN_CONSTANTS.DAILY_LOGIN_BONUS,
          description: 'Daily login bonus',
        },
      });
    });
  }
}
