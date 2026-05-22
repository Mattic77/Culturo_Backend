import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WaitingPlayer {
  userId: string;
  socketId: string;
  username: string;
  joinedAt: Date;
}

@Injectable()
export class BattleService {
  private matchmakingQueue: WaitingPlayer[] = [];
  private activeBattles = new Map<string, any>(); // battleId -> battleState

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a player to the matchmaking queue
   */
  addToQueue(player: WaitingPlayer): void {
    // Check if player is already in queue
    const exists = this.matchmakingQueue.find((p) => p.userId === player.userId);
    if (!exists) {
      this.matchmakingQueue.push(player);
    }
  }

  /**
   * Remove a player from the queue (e.g., on disconnect)
   */
  removeFromQueue(userId: string): void {
    this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.userId !== userId);
  }

  /**
   * Try to find a match for players in the queue
   */
  findMatch(): { player1: WaitingPlayer; player2: WaitingPlayer } | null {
    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift();
      const player2 = this.matchmakingQueue.shift();
      return { player1, player2 };
    }
    return null;
  }

  /**
   * Initialize a battle in the database
   */
  async createBattle(user1Id: string, user2Id: string) {
    return this.prisma.battle.create({
      data: {
        user1Id,
        user2Id,
      },
    });
  }
}
