import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get detailed level and XP information for a specific user
   */
  async getUserLevel(userId: string) {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      throw new NotFoundException('Level information not found for this user');
    }

    // Example logic for next level XP (can be adjusted as needed)
    // Here we assume level 1: 0-100, level 2: 100-300, etc.
    // For now, let's use a simple formula: nextLevelXP = currentLevel * 100 * 1.5
    const nextLevelXP = Math.floor(userLevel.level * 100 * 1.5);
    const progressPercentage = Math.min(Math.round((userLevel.xp / nextLevelXP) * 100), 100);

    return {
      ...userLevel,
      nextLevelXP,
      progressPercentage,
    };
  }

  /**
   * Get all ranks available in the system
   */
  async getAllRanks() {
    return this.prisma.ranked.findMany({
      orderBy: { minScore: 'asc' },
    });
  }

  /**
   * Get the current rank of a user (Online and Offline)
   */
  async getUserRanks(userId: string) {
    const [onlineRank, offlineRank] = await Promise.all([
      this.prisma.userRankOnline.findFirst({
        where: { userId },
        include: { rank: true },
      }),
      this.prisma.userRankOffline.findFirst({
        where: { userId },
        include: { rank: true },
      }),
    ]);

    return {
      online: onlineRank || null,
      offline: offlineRank || null,
    };
  }

  /**
   * Get global leaderboards (Top 10 by XP and Top 10 by Rank Points)
   */
  async getLeaderboard() {
    const [topByXP, topByRank] = await Promise.all([
      // Top 10 by Level/XP
      this.prisma.userLevel.findMany({
        take: 10,
        orderBy: { xp: 'desc' },
        include: {
          user: {
            select: { username: true, color: true },
          },
        },
      }),
      // Top 10 by Online Rank Points
      this.prisma.userRankOnline.findMany({
        take: 10,
        orderBy: { points: 'desc' },
        include: {
          user: {
            select: { username: true, color: true },
          },
          rank: true,
        },
      }),
    ]);

    return {
      topByXP: topByXP.map((entry) => ({
        userId: entry.userId,
        username: entry.user.username,
        color: entry.user.color,
        level: entry.level,
        xp: entry.xp,
      })),
      topByRank: topByRank.map((entry) => ({
        userId: entry.userId,
        username: entry.user.username,
        color: entry.user.color,
        points: entry.points,
        rank: entry.rank,
      })),
    };
  }

  /**
   * Create a new rank (Admin only)
   */
  async createRank(data: { name: string; minScore: number; maxScore: number }) {
    return this.prisma.ranked.create({ data });
  }

  /**
   * Update a rank (Admin only)
   */
  async updateRank(id: string, data: { name?: string; minScore?: number; maxScore?: number }) {
    return this.prisma.ranked.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a rank (Admin only)
   */
  async deleteRank(id: string) {
    await this.prisma.ranked.delete({ where: { id } });
    return { message: 'Rank deleted successfully' };
  }
}
