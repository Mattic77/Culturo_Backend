import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatus } from '@prisma/client';

@Injectable()
export class ChallengeService {
  constructor(private prisma: PrismaService) {}

  async create(createChallengeDto: CreateChallengeDto) {
    return this.prisma.challenge.create({
      data: {
        description: createChallengeDto.description,
        startAt: createChallengeDto.startAt ? new Date(createChallengeDto.startAt) : undefined,
        endAt: createChallengeDto.endAt ? new Date(createChallengeDto.endAt) : undefined,
        status: createChallengeDto.status,
        score: createChallengeDto.score,
        isPublic: createChallengeDto.isPublic,
      },
    });
  }

  async updateStatus(id: string, status: ChallengeStatus) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return this.prisma.challenge.update({
      where: { id },
      data: { status },
    });
  }

  async updateIsPublic(id: string, isPublic: boolean) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return this.prisma.challenge.update({
      where: { id },
      data: { isPublic },
    });
  }

  async getSelectedChallenges() {
    return this.prisma.challenge.findMany({
      where: { isPublic: true },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                color: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.challenge.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return challenge;
  }
}
