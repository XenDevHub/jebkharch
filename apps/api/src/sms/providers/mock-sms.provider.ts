import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from '../interfaces/sms-provider.interface';

/**
 * MockSmsProvider — Development stub for SMS sending.
 *
 * Logs OTP to console instead of sending a real SMS.
 * In dev mode, the magic OTP is always "123456" for any number.
 *
 * TODO: Replace this with a real Pakistani SMS gateway provider.
 * See: src/sms/interfaces/sms-provider.interface.ts for integration instructions.
 */
@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    this.logger.warn(`[MOCK SMS] OTP for ${phone}: ${otp}`);
    this.logger.warn('[MOCK SMS] This is a development stub. Configure a real SMS provider for production.');
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 100));
    return true;
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    this.logger.warn(`[MOCK SMS] Message to ${phone}: ${message}`);
    await new Promise((r) => setTimeout(r, 100));
    return true;
  }
}
