import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RagService } from './rag.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Difficulty } from '@prisma/client';

@Injectable()
export class RagTaskService {
  private readonly logger = new Logger(RagTaskService.name);

  constructor(
    private readonly ragService: RagService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Automatically generate 100 new questions every week.
   * Runs every Sunday at midnight.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyQuizGeneration() {
    this.logger.log(
      'Starting weekly AI quiz generation (Goal: 100 questions)...',
    );

    const countries = await this.prisma.country.findMany();
    const categories = await this.prisma.category.findMany();

    if (countries.length === 0 || categories.length === 0) {
      this.logger.error(
        'No countries or categories found. Aborting generation.',
      );
      return;
    }

    let totalGenerated = 0;
    const goal = 100;
    const maxAttempts = 200; // Prevent infinite loops if context is missing
    let attempts = 0;

    while (totalGenerated < goal && attempts < maxAttempts) {
      attempts++;

      // Pick random country, category and difficulty
      const country = countries[Math.floor(Math.random() * countries.length)];
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const difficulties = Object.values(Difficulty);
      const difficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];

      try {
        // Generate 5 questions at a time for this combination
        const newQuizzes = await this.ragService.generateQuiz(
          country.id,
          category.id,
          difficulty,
          5,
        );

        totalGenerated += newQuizzes.length;
        this.logger.log(
          `Generated ${newQuizzes.length} new questions for ${country.name} (${category.name}). Progress: ${totalGenerated}/${goal}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate questions for ${country.name}/${category.name}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Weekly generation finished. Total new questions added: ${totalGenerated}`,
    );
  }
}
