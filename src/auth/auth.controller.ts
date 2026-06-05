import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthWithOtpDto, createOtpDto } from './dto/create-auth.dto';

import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'User Registration' })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    schema: {
      example: {
        message: 'User created successfully',
        user: { id: 'uuid', email: 'user@example.com' },
        accessToken: 'token',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  create(@Body() createAuthDto: CreateAuthWithOtpDto) {
    return this.authService.create(createAuthDto);
  }

  @ApiOperation({ summary: 'Request Registration OTP' })
  @ApiCreatedResponse({ description: 'OTP sent successfully.' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('signup-otp')
  createWithOtp(@Body() createAuthWithOtpDto: createOtpDto) {
    return this.authService.emailconfirmation(createAuthWithOtpDto);
  }

  @ApiOperation({ summary: 'User Login' })
  @ApiCreatedResponse({
    description: 'Signed in successfully.',
    schema: {
      example: {
        message: 'Signed in successfully',
        accessToken: 'refresh-or-access-token',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials.' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('signin')
  signIn(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.signIn(loginAuthDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current User Profile' })
  @ApiCreatedResponse({ description: 'Profile retrieved successfully.' })
  @Get('me')
  me(@Request() req: { user: { token: string } }) {
    return {
      message: 'You are authenticated',
      token: req.user.token,
    };
  }
}
