import { HttpException, Injectable } from '@nestjs/common';
import { CreateAuthWithOtpDto, createOtpDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { TokenHandler } from './helpers/tokenHandler';
import { PrismaService } from '../prisma/prisma.service';
import { OtpGenerate } from './helpers/otpGenerate';
import { AuthEmail } from './email/auth_email';
@Injectable()
export class AuthService {
  private readonly tokenHandler: TokenHandler;

  constructor(
    private readonly prisma: PrismaService,
    tokenHandler: TokenHandler,
  ) {
    this.tokenHandler = tokenHandler;
  }
  async emailconfirmation(createAuthWithOtpDto: createOtpDto) {
    if (!createAuthWithOtpDto.email) {
      throw new HttpException('Email is required', 400);
    }
    const otp = Number.parseInt(OtpGenerate.generateOtp(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    await this.prisma.otp.upsert({
      where: { email: createAuthWithOtpDto.email },
      update: {
        code: otp,
        expiresAt: expiresAt,
      },
      create: {
        email: createAuthWithOtpDto.email,
        code: otp,
        expiresAt: expiresAt,
      },
    });
    try {
      await AuthEmail.confirmation(createAuthWithOtpDto.email, otp);
    } catch (error) {
      throw new HttpException(
        `Failed to send confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }

    return {
      message: 'OTP sent to email',
    };
  }

  async create(createAuthDto: CreateAuthWithOtpDto) {
    const otpValid = await this.optpVerification(
      createAuthDto.email,
      createAuthDto.code,
    );
    if (!otpValid) {
      throw new HttpException('OTP verification failed', 400);
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });
    if (existing) {
      throw new HttpException('User with this email already exists', 400);
    }

    const hashpassword = await bcrypt.hash(createAuthDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createAuthDto.email,
        password: hashpassword,
        isActivate: true,
        userLevel: {
          create: {},
        },
      },
    });
    const token = await this.tokenHandler.createAndSaveTokens(user.id);
    try {
      await AuthEmail.welcoming(
        createAuthDto.email,
        user.username || user.email,
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // We don't throw here to avoid blocking registration if only the welcome email fails
    }
    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken: token.token,
    };
  }

  async optpVerification(email: string, otp: number) {
    const record = await this.prisma.otp.findUnique({
      where: { email },
    });
    if (!record) {
      throw new HttpException('OTP not found for this email', 404);
    }
    if (record.code !== otp) {
      throw new HttpException('Invalid OTP', 400);
    }
    if (record.expiresAt < new Date()) {
      throw new HttpException('OTP has expired', 400);
    }
    await this.prisma.otp.delete({
      where: { email },
    });
    return true;
  }
  async signIn(loginAuthDto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });
    console.log(loginAuthDto.password);
    console.log(user?.password);
    if (!user?.password || !loginAuthDto.password) {
      throw new HttpException('Invalid credentials', 401);
    }
    if (
      !user ||
      !(await bcrypt.compare(loginAuthDto.password, user.password))
    ) {
      throw new HttpException('Invalid credentials', 402);
    }
    const token = await this.tokenHandler.createAndSaveTokens(user.id);
    return {
      message: 'Signed in successfully',
      user: {
        username: user.username,
      },
      accessToken: token.token,
    };
  }
}
