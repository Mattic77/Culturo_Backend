import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WaitingPlayer {
  userId: string;
  socketId: string;
  username: string;
  joinedAt: Date;
}

export interface BattleState {
  battleId: string;
  roomId: string;
  players: {
    userId: string;
    socketId: string;
    username: string;
    score: number;
    hasAnswered: boolean;
  }[];
  questions: any[];
  currentQuestionIndex: number;
  roundStartTime: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
}

@Injectable()
export class BattleService {
  private matchmakingQueue: WaitingPlayer[] = [];
  private activeBattles = new Map<string, BattleState>(); // roomId -> battleState

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a player to the matchmaking queue
   */
  addToQueue(player: WaitingPlayer): void {
    const exists = this.matchmakingQueue.find((p) => p.userId === player.userId);
    if (!exists) {
      this.matchmakingQueue.push(player);
    }
  }

  /**
   * Remove a player from the queue
   */
  removeFromQueue(userId: string): void {
    this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.userId !== userId);
  }

  /**
   * Try to find a match
   */
  findMatch(): { player1: WaitingPlayer; player2: WaitingPlayer } | null {
    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift();
      const player2 = this.matchmakingQueue.shift();

      if (player1 && player2) {
        return { player1, player2 };
      }
    }
    return null;
  }

  /**
   * Initialize a battle in the database and pick questions
   */
  async initializeBattle(player1: WaitingPlayer, player2: WaitingPlayer) {
    // 1. Pick 15 random questions
    const quizzes = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, question, answer, suggested_answer as "suggestedAnswer", category_id as "categoryId", country_id as "countryId"
      FROM quiz
      ORDER BY RANDOM()
      LIMIT 15
    `);

    // 2. Create battle in DB
    const battle = await this.prisma.battle.create({
      data: {
        user1Id: player1.userId,
        user2Id: player2.userId,
      },
    });

    const roomId = `battle_${battle.id}`;

    // 3. Create active state
    const state: BattleState = {
      battleId: battle.id,
      roomId,
      players: [
        { ...player1, score: 0, hasAnswered: false },
        { ...player2, score: 0, hasAnswered: false },
      ],
      questions: quizzes,
      currentQuestionIndex: 0,
      roundStartTime: 0,
      status: 'WAITING',
    };

    this.activeBattles.set(roomId, state);
    return state;
  }

  getBattleState(roomId: string): BattleState | undefined {
    return this.activeBattles.get(roomId);
  }

  updateBattleState(roomId: string, state: BattleState): void {
    this.activeBattles.set(roomId, state);
  }

  removeBattleState(roomId: string): void {
    this.activeBattles.delete(roomId);
  }

  /**
   * Calculate points based on speed and correctness
   */
  calculatePoints(isCorrect: boolean, timeTakenMs: number): number {
    if (!isCorrect) return 0;
    
    // Base points for correct answer
    const basePoints = 100;
    
    // Speed bonus: 10 seconds (10000ms) max. 
    // Faster answer = more bonus.
    const maxBonus = 50;
    const speedBonus = Math.max(0, Math.floor(((10000 - timeTakenMs) / 10000) * maxBonus));
    
    return basePoints + speedBonus;
  }

  /**
   * Finalize battle in DB and award rewards
   */
  async finalizeBattle(battleId: string, winnerId: string | null) {
    const battle = await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        winnerId,
        battleEndAt: new Date(),
      },
      include: {
        user1: { include: { userLevel: true } },
        user2: { include: { userLevel: true } },
      }
    });

    // Award XP: 100 for winner, 20 for loser, 50 for draw
    if (winnerId) {
      const loserId = battle.user1Id === winnerId ? battle.user2Id : battle.user1Id;
      await this.awardXp(winnerId, 100);
      await this.awardXp(loserId, 20);
    } else {
      // Draw
      await this.awardXp(battle.user1Id, 50);
      await this.awardXp(battle.user2Id, 50);
    }

    return battle;
  }

  private async awardXp(userId: string, amount: number) {
    const userLevel = await this.prisma.userLevel.findUnique({ where: { userId } });
    if (!userLevel) return;

    const newXp = userLevel.xp + amount;
    const newLevel = this.calculateLevel(newXp);

    await this.prisma.userLevel.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        isBattleUnlocked: newXp >= 1000 || userLevel.isBattleUnlocked
      }
    });
  }

  private calculateLevel(xp: number): number {
    if (xp >= 5000) return 10;
    if (xp >= 4000) return 8;
    if (xp >= 3000) return 6;
    if (xp >= 2000) return 4;
    if (xp >= 1000) return 2;
    return 1;
  }
}
