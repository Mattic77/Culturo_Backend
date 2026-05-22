import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get an overview of platform performance
   */
  async getGlobalStats() {
    const [
      userCount,
      quizCount,
      gameSessionsCount,
      battleCount,
      activeUsersToday,
      categoryCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.quiz.count(),
      this.prisma.gameSession.count(),
      this.prisma.battle.count(),
      this.prisma.user.count({
        where: {
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.category.count(),
    ]);

    // Fetch popular categories
    const topCategories = await this.prisma.category.findMany({
      take: 5,
      include: {
        _count: {
          select: { quizzes: true, games: true },
        },
      },
    });

    return {
      overview: {
        totalUsers: userCount,
        activeUsersToday,
        totalQuizzes: quizCount,
        totalGamesPlayed: gameSessionsCount + battleCount,
        totalSoloGames: gameSessionsCount,
        totalBattles: battleCount,
        totalCategories: categoryCount,
      },
      content: {
        topCategories: topCategories.map((c) => ({
          name: c.name,
          quizzes: c._count.quizzes,
          gamesPlayed: c._count.games,
        })),
      },
    };
  }
}
