import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MoodService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateMoodEntryDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingEntry = await this.prisma.moodEntry.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingEntry) {
      throw new ConflictException('Ви вже додали запис сьогодні');
    }

    return this.prisma.moodEntry.create({
      data: {
        mood: dto.mood,
        notes: dto.notes,
        userId,
        date: new Date(),
      },
    });
  }

  async findAll(user: any, targetUserId: number) {
    if (user.id === targetUserId) {
      return this.prisma.moodEntry.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });
    }

    if (user.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!psychologist) {
        throw new NotFoundException('Psychologist not found');
      }

      const isAssigned = await this.prisma.psychologistOnUser.findFirst({
        where: {
          psychologistId: psychologist.id,
          userId: targetUserId,
          dataStatus: 'approved',
        },
      });

      if (isAssigned) {
        return this.prisma.moodEntry.findMany({
          where: { userId: targetUserId },
          orderBy: { date: 'desc' },
        });
      }

      throw new NotFoundException('Access denied: Not assigned to this user');
    }
  }

  async findOne(id: number, userId: number) {
    return this.prisma.moodEntry.findFirst({
      where: { id, userId },
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.moodEntry.deleteMany({
      where: { id, userId },
    });
  }
}
