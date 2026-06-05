import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartGameDto, CountrySelection } from './dto/start-game.dto';
import { Difficulty, Prisma } from '@prisma/client';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(userId: string, dto: StartGameDto) {
    let countryId: string | undefined = undefined;
    let difficulty: Difficulty | undefined = undefined;

    // Check user XP restriction
    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await this.prisma.userLevel.create({
        data: { userId, xp: 0, level: 1 },
      });
    }

    const isLowXp = userLevel.xp < 1000;

    // Handle Difficulty
    if (isLowXp) {
      difficulty = Difficulty.Easy;
    } else if (dto.difficulty && dto.difficulty.toLowerCase() !== 'random') {
      difficulty = dto.difficulty as Difficulty;
    }

    // Handle Country Selection
    if (!dto.countrySelection) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { preferredCountryId: true },
      });
      countryId = user?.preferredCountryId || undefined;
    } else if (dto.countrySelection === CountrySelection.RANDOM) {
      const randomCountry = await this.prisma.country.findFirst({
        orderBy: { id: 'asc' },
        skip: Math.floor(Math.random() * (await this.prisma.country.count())),
      });
      countryId = randomCountry?.id;
    } else if (dto.countrySelection !== CountrySelection.ALL) {
      countryId = dto.countrySelection;
    }

    const categoryId = dto.categoryId;

    // Fetch 15 random quiz IDs
    const quizzes = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM quiz
      WHERE 1=1
      ${countryId ? `AND country_id = '${countryId}'` : ''}
      ${categoryId ? `AND category_id = '${categoryId}'` : ''}
      ${difficulty ? `AND difficulty = '${difficulty}'` : ''}
      ORDER BY RANDOM()
      LIMIT 15
    `);

    if (quizzes.length === 0) {
      throw new NotFoundException(
        'No questions found for the selected filters.',
      );
    }

    // Create Session
    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        difficulty,
        countryId,
        questions: {
          create: quizzes.map((q, index) => ({
            quizId: q.id,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: {
          where: { order: 1 },
          include: { quiz: { include: { category: true, country: true } } },
        },
      },
    });

    const firstQuestion = session.questions[0];
    return {
      sessionId: session.id,
      totalQuestions: quizzes.length,
      firstQuestion: this.stripAnswer(firstQuestion.quiz),
    };
  }

  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: dto.sessionId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!session || session.userId !== userId || session.status !== 'ACTIVE') {
      throw new NotFoundException('Active session not found.');
    }

    const currentQuestion = session.questions.find(
      (q) => q.quizId === dto.quizId && !q.isAnswered,
    );

    if (!currentQuestion) {
      throw new NotFoundException('Question not found or already answered.');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    const isCorrect =
      quiz.answer.toLowerCase().trim() === dto.answer.toLowerCase().trim();

    // Update progress
    await this.prisma.gameSessionQuestion.update({
      where: { id: currentQuestion.id },
      data: {
        isAnswered: true,
        isCorrect,
      },
    });

    if (isCorrect) {
      await this.prisma.gameSession.update({
        where: { id: session.id },
        data: { currentScore: { increment: 1 } },
      });
    }

    // Find next question
    const nextQuestionRecord = session.questions.find(
      (q) => q.order === currentQuestion.order + 1,
    );

    let nextQuestion = null;
    if (nextQuestionRecord) {
      const nextQuiz = await this.prisma.quiz.findUnique({
        where: { id: nextQuestionRecord.quizId },
        include: { category: true, country: true },
      });
      nextQuestion = this.stripAnswer(nextQuiz);
    }

    return {
      isCorrect,
      correctAnswer: isCorrect ? undefined : quiz.answer,
      nextQuestion,
    };
  }

  async completeSession(userId: string, sessionId: string) {
    if (!sessionId) {
      throw new NotFoundException('Session ID is required.');
    }

    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session || session.userId !== userId || session.status !== 'ACTIVE') {
      throw new NotFoundException('Active session not found.');
    }

    const unanswered = session.questions.filter((q) => !q.isAnswered);
    if (unanswered.length > 0) {
      // Allow completion but score is based on answered
    }

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Award XP (using logic from plan)
    const difficulty = session.difficulty || Difficulty.Easy;
    const xpPerAnswer = {
      [Difficulty.Easy]: 5,
      [Difficulty.Medium]: 10,
      [Difficulty.Hard]: 20,
    };

    const earnedXp = session.currentScore * xpPerAnswer[difficulty];

    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await this.prisma.userLevel.create({
        data: { userId, xp: 0, level: 1 },
      });
    }

    const newXp = userLevel.xp + earnedXp;
    const newLevel = this.calculateLevel(newXp);

    const updatedUserLevel = await this.prisma.userLevel.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        isBattleUnlocked: newXp >= 1000 || userLevel.isBattleUnlocked,
      },
    });

    // Create Games record
    await this.prisma.games.create({
      data: {
        userId,
        countryId: session.countryId,
        difficulty: difficulty,
        score: session.currentScore,
      },
    });

    return {
      finalScore: session.currentScore,
      earnedXp,
      totalXp: updatedUserLevel.xp,
      level: updatedUserLevel.level,
      isBattleUnlocked: updatedUserLevel.isBattleUnlocked,
    };
  }

  private stripAnswer(quiz: any) {
    if (!quiz) return null;
    const { answer, ...rest } = quiz;
    return rest;
  }

  private calculateLevel(xp: number): number {
    if (xp >= 1000) return 3;
    if (xp >= 500) return 2;
    return 1;
  }
}
