import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { ContinentModule } from './continent/continent.module';
import { CountryModule } from './country/country.module';
import { QuizModule } from './quiz/quiz.module';
import { GameModule } from './game/game.module';
import { ProgressionModule } from './progression/progression.module';
import { BattleModule } from './battle/battle.module';
import { AdminModule } from './admin/admin.module';
import { FriendModule } from './friend/friend.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute globally
      },
    ]),
    AuthModule,
    UserModule,
    PrismaModule,
    CategoryModule,
    CloudinaryModule,
    ContinentModule,
    CountryModule,
    QuizModule,
    GameModule,
    ProgressionModule,
    BattleModule,
    AdminModule,
    FriendModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
