import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChallengeTaskService } from './challenge-task.service';

@Module({
  imports: [PrismaModule],
  providers: [ChallengeService, ChallengeTaskService],
  controllers: [ChallengeController],
  exports: [ChallengeService],
})
export class ChallengeModule {}
