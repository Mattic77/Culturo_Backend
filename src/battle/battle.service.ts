import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty } from '@prisma/client';

export interface WaitingPlayer {
  userId: string;
  socketId: string;
  username: string;
  joinedAt: Date;
}

export interface ActiveBattle {
  battleId: string;
  user1Id: string;
  user2Id: string;
  roomId: string;
  ended: boolean;
}

@Injectable()
export class BattleService {
  private matchmakingQueue: WaitingPlayer[] = [];
  private activeBattles = new Map<string, ActiveBattle>();
  private battleByUserId = new Map<string, string>();
  private readonly battleWinXp = 50;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a player to the matchmaking queue
   */
  addToQueue(player: WaitingPlayer): void {
    // Check if player is already in queue
    const exists = this.matchmakingQueue.find(
      (p) => p.userId === player.userId,
    );
    if (!exists) {
      this.matchmakingQueue.push(player);
    }
  }

  /**
   * Remove a player from the queue (e.g., on disconnect)
   */
  removeFromQueue(userId: string): void {
    this.matchmakingQueue = this.matchmakingQueue.filter(
      (p) => p.userId !== userId,
    );
  }

  /**
   * Try to find a match for players in the queue
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

  registerBattle(
    battleId: string,
    user1Id: string,
    user2Id: string,
    roomId: string,
  ): void {
    const battleState: ActiveBattle = {
      battleId,
      user1Id,
      user2Id,
      roomId,
      ended: false,
    };

    this.activeBattles.set(battleId, battleState);
    this.battleByUserId.set(user1Id, battleId);
    this.battleByUserId.set(user2Id, battleId);
  }

  async handlePlayerDisconnect(userId: string) {
    const battleId = this.battleByUserId.get(userId);
    if (!battleId) {
      return null;
    }

    const battleState = this.activeBattles.get(battleId);
    if (!battleState || battleState.ended) {
      this.battleByUserId.delete(userId);
      return null;
    }

    const winnerId =
      battleState.user1Id === userId
        ? battleState.user2Id
        : battleState.user1Id;

    battleState.ended = true;
    this.activeBattles.delete(battleId);
    this.battleByUserId.delete(battleState.user1Id);
    this.battleByUserId.delete(battleState.user2Id);

    const updatedBattle = await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        winnerId,
        battleEndAt: new Date(),
      },
    });

    await this.awardBattleWinnerXp(winnerId);

    return updatedBattle;
  }

  private async awardBattleWinnerXp(userId: string) {
    let userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await this.prisma.userLevel.create({
        data: { userId, xp: 0, level: 1 },
      });
    }

    const newXp = userLevel.xp + this.battleWinXp;
    const newLevel = this.calculateLevel(newXp);

    await this.prisma.userLevel.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        isBattleUnlocked: newXp >= 1000 || userLevel.isBattleUnlocked,
      },
    });
  }

  private calculateLevel(xp: number): number {
    if (xp >= 1000) return 3;
    if (xp >= 500) return 2;
    return 1;
  }
}
