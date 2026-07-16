import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, CreateProfileDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP to Pakistani phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone or too soon to resend' })
  @ApiResponse({ status: 403, description: 'Too many failed attempts — blocked' })
  async sendOtp(@Body() dto: SendOtpDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.sendOtp(dto, ip);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code — returns isNewUser flag' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('create-profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete registration — create user profile after OTP verification' })
  async createProfile(@Body() dto: CreateProfileDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.createProfile(dto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login existing user via phone + OTP' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}
