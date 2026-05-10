import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: string; token: string } }>();

    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    if (!authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const decoded = this.jwtService.verify<{ sub?: string }>(token);
      const userId = decoded?.sub;
      if (!userId) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      request.user = { id: userId, token };
      return true;
    } catch {
      // Not a JWT or verification failed — try matching stored token string in DB
      const tokenRecord = await this.prisma.token.findUnique({
        where: { hashedToken: token },
        select: { userId: true, expiresAt: true },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (tokenRecord.expiresAt && tokenRecord.expiresAt <= new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      request.user = { id: tokenRecord.userId, token };
      return true;
    }
  }
}
