import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketEvent } from '@jebkharch/shared';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*', // Restrict in production
    credentials: true,
  },
  namespace: '/challenge',
})
export class ChallengeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChallengeGateway.name);

  // Map: userId -> socketId
  private userSockets = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_ACCESS_SECRET') });
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Unauthorized socket connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_challenge_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { challengeId: string }) {
    client.join(`challenge:${data.challengeId}`);
    this.logger.log(`Socket ${client.id} joined room: challenge:${data.challengeId}`);
  }

  // ── Emit Helpers (called by ChallengeService) ─────────────────────────────

  notifyChallengeStarted(challengeId: string, creatorId: string, opponentId: string) {
    this.server.to(`challenge:${challengeId}`).emit(SocketEvent.CHALLENGE_STARTED, {
      challengeId,
      message: 'Opponent joined! Challenge is starting...',
    });

    // Countdown: 3, 2, 1, GO
    let count = 3;
    const interval = setInterval(() => {
      this.server.to(`challenge:${challengeId}`).emit(SocketEvent.CHALLENGE_COUNTDOWN, { count });
      count--;
      if (count < 0) clearInterval(interval);
    }, 1000);
  }

  notifyChallengeCompleted(challengeId: string, result: any) {
    this.server.to(`challenge:${challengeId}`).emit(SocketEvent.CHALLENGE_COMPLETED, result);
  }

  notifyUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
