import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const authHeader = client.handshake.headers?.authorization || client.handshake.auth?.token;

    if (!authHeader) {
      throw new WsException('Missing authentication token');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader;

    try {
      // 1. Try JWT Verification
      const decoded = this.jwtService.verify<{ sub?: string }>(token);
      const userId = decoded?.sub;

      if (!userId) {
        throw new WsException('Invalid token');
      }

      // Attach user data to the socket for easy access in the Gateway
      client.data.user = { id: userId };
      return true;
    } catch (error) {
      // 2. Try DB Token Check (if JWT fails or for manual tokens)
      const tokenRecord = await this.prisma.token.findUnique({
        where: { hashedToken: token },
        select: { userId: true, expiresAt: true },
      });

      if (!tokenRecord) {
        throw new WsException('Invalid or expired token');
      }

      if (tokenRecord.expiresAt && tokenRecord.expiresAt <= new Date()) {
        throw new WsException('Token expired');
      }

      client.data.user = { id: tokenRecord.userId };
      return true;
    }
  }
}
