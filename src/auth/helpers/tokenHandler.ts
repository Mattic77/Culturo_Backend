import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenHandler {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async createAndSaveTokens(userId: string) {
    const payload = { sub: userId };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '60d',
    });

    // 2. Hash the token for storage (treat stored token as a refresh token)
    const hashedtoken = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 3. Save the hashed Refresh Token to the database
    // Using upsert because userId is unique
    await this.prisma.token.upsert({
      where: { userId: userId },
      update: {
        hashedToken: hashedtoken,
        expiresAt: expiresAt,
      },
      create: {
        userId: userId,
        hashedToken: hashedtoken,
        expiresAt: expiresAt,
      },
    });

    // Return the plain JWT to be used as the access token by clients
    return {
      token,
    };
  }
}
