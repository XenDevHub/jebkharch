import { Module } from '@nestjs/common';
import { SMS_PROVIDER } from './interfaces/sms-provider.interface';
import { MockSmsProvider } from './providers/mock-sms.provider';

@Module({
  providers: [
    {
      provide: SMS_PROVIDER,
      // TODO: Switch based on SMS_PROVIDER env var to real provider
      useClass: MockSmsProvider,
    },
  ],
  exports: [SMS_PROVIDER],
})
export class SmsModule {}
