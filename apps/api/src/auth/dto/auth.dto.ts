import { IsString, IsEnum, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpPurpose } from '@jebkharch/shared';

const PAKISTAN_PHONE_REGEX = /^(\+92|0092|0)?3[0-9]{9}$/;

export class SendOtpDto {
  @ApiProperty({ example: '03001234567', description: 'Pakistani mobile number' })
  @IsString()
  @Matches(PAKISTAN_PHONE_REGEX, { message: 'Please provide a valid Pakistani phone number' })
  phone: string;

  @ApiProperty({ enum: OtpPurpose, default: OtpPurpose.LOGIN })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose = OtpPurpose.LOGIN;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '03001234567' })
  @IsString()
  @Matches(PAKISTAN_PHONE_REGEX, { message: 'Please provide a valid Pakistani phone number' })
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otpCode: string;

  @ApiProperty({ enum: OtpPurpose })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}

export class CreateProfileDto {
  @ApiProperty({ example: '03001234567' })
  @IsString()
  @Matches(PAKISTAN_PHONE_REGEX)
  phone: string;

  @ApiProperty({ example: 'Ali Khan', description: 'Display name (2-30 chars)' })
  @IsString()
  @Matches(/^.{2,30}$/, { message: 'Name must be between 2 and 30 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'JEB45892', description: 'Optional referral code from a friend' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ description: 'Device fingerprint for fraud detection' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceModel?: string;
}

export class LoginDto {
  @ApiProperty({ example: '03001234567' })
  @IsString()
  @Matches(PAKISTAN_PHONE_REGEX)
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  otpCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceModel?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
