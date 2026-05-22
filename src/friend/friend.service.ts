import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus, InviteStatus } from '@prisma/client';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    // Check if relationship already exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Friendship or request already exists');
    }

    return this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: FriendshipStatus.PENDING,
      },
    });
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    return this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
  }

  /**
   * Get list of friends
   */
  async getFriendsList(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: FriendshipStatus.ACCEPTED },
          { receiverId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        sender: {
          select: { id: true, username: true, color: true },
        },
        receiver: {
          select: { id: true, username: true, color: true },
        },
      },
    });

    return friendships.map((f) => (f.senderId === userId ? f.receiver : f.sender));
  }

  /**
   * Get pending requests
   */
  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        sender: {
          select: { id: true, username: true, color: true },
        },
      },
    });
  }

  /**
   * Battle Invites
   */
  async createBattleInvite(senderId: string, receiverId: string) {
    // Verify they are friends
    const areFriends = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: FriendshipStatus.ACCEPTED },
          { senderId: receiverId, receiverId: senderId, status: FriendshipStatus.ACCEPTED },
        ],
      },
    });

    if (!areFriends) {
      throw new BadRequestException('You can only invite friends to a battle');
    }

    return this.prisma.battleInvite.create({
      data: {
        senderId,
        receiverId,
        status: InviteStatus.PENDING,
      },
    });
  }
}
