/**
 * ISmsProvider — Pluggable SMS provider interface.
 *
 * TODO: Replace MockSmsProvider with a real Pakistani SMS gateway.
 * Candidates:
 *   - Jazz Messaging Service (JMS)
 *   - Telenor Pakistan SMS API
 *   - Zong SMS API
 *   - Twilio (with Pakistani numbers)
 *
 * Implementation location: src/sms/providers/<provider-name>.provider.ts
 */
export interface ISmsProvider {
  /**
   * Send an OTP SMS to a Pakistani phone number.
   * @param phone  - Pakistani phone number (e.g., '03001234567')
   * @param otp    - 6-digit OTP code
   * @returns      - true if sent successfully
   */
  sendOtp(phone: string, otp: string): Promise<boolean>;

  /**
   * Send a generic transactional SMS.
   */
  sendMessage(phone: string, message: string): Promise<boolean>;
}

export const SMS_PROVIDER = 'SMS_PROVIDER';
