import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expoPushEndpoint = 'https://exp.host/--/api/v2/push/send';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a push notification to a specific user by userId
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true, name: true },
    });

    if (!user || !user.expoPushToken) {
      this.logger.debug(`User ${userId} does not have an active push token`);
      return false;
    }

    return this.sendToToken(user.expoPushToken, payload);
  }

  /**
   * Send a push notification to a raw Expo push token
   */
  async sendToToken(token: string, payload: PushNotificationPayload): Promise<boolean> {
    const trimmed = token?.trim();
    if (!trimmed || trimmed.length < 5) {
      this.logger.warn(`Invalid push token: ${token}`);
      return false;
    }

    try {
      const response = await fetch(this.expoPushEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: trimmed,
          sound: payload.sound || 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          badge: payload.badge,
        }),
      });

      const data = await response.json();
      this.logger.log(`Push notification response for ${trimmed}: ${JSON.stringify(data)}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Broadcast a push notification to all active players
   */
  async broadcastToAll(payload: PushNotificationPayload): Promise<{ sent: number; failed: number }> {
    const users = await this.prisma.user.findMany({
      where: {
        expoPushToken: {
          not: null,
        },
      },
      select: { expoPushToken: true },
    });

    const tokens = users
      .map((u) => u.expoPushToken?.trim())
      .filter((t): t is string => !!t && t.length > 5);

    if (tokens.length === 0) {
      this.logger.warn('[broadcastToAll] No users found with registered push tokens.');
      return { sent: 0, failed: 0 };
    }

    // Expo allows sending up to 100 messages per chunk
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 100) {
      chunks.push(tokens.slice(i, i + 100));
    }

    let sent = 0;
    let failed = 0;

    for (const chunk of chunks) {
      try {
        const messages = chunk.map((token) => ({
          to: token,
          sound: payload.sound || 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
        }));

        const res = await fetch(this.expoPushEndpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        const resData = await res.json();
        this.logger.log(`Broadcast chunk sent to ${chunk.length} devices. Expo response: ${JSON.stringify(resData)}`);

        sent += chunk.length;
      } catch (e: any) {
        this.logger.error(`Broadcast chunk error: ${e?.message}`);
        failed += chunk.length;
      }
    }

    return { sent, failed };
  }
}
