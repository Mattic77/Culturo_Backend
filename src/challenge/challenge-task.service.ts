import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeStatus } from '@prisma/client';

@Injectable()
export class ChallengeTaskService {
  private readonly logger = new Logger(ChallengeTaskService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Automatically expires challenges that have reached their end date.
   * Runs every minute.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredChallenges() {
    this.logger.debug('Running background task: Expiring challenges...');

    const now = new Date();

    try {
      const result = await this.prisma.challenge.updateMany({
        where: {
          status: { not: ChallengeStatus.EXPIRED },
          endAt: {
            lt: now,
            not: null,
          },
        },
        data: {
          status: ChallengeStatus.EXPIRED,
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Success: Automatically expired ${result.count} challenges.`,
        );
      }
    } catch (error) {
      this.logger.error('Error during challenge expiration task:', error);
    }
  }

  /**
   * Automatically starts challenges that have reached their start date.
   * Runs every minute.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleStartedChallenges() {
    this.logger.debug('Running background task: Starting challenges...');

    const now = new Date();

    try {
      const result = await this.prisma.challenge.updateMany({
        where: {
          status: ChallengeStatus.PENDING,
          startAt: {
            lte: now,
          },
        },
        data: {
          status: ChallengeStatus.STARTED,
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Success: Automatically started ${result.count} challenges.`,
        );
      }
    } catch (error) {
      this.logger.error('Error during challenge starting task:', error);
    }
  }
}
