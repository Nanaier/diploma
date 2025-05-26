import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getMyAvailability(psychologistId: number) {
    return this.prisma.weeklyAvailability.findMany({
      where: { psychologistId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createAvailability(
    psychologistId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) {
    // Check for overlapping availability
    const isOverlapping = await this.checkForOverlap(
      +psychologistId,
      +dayOfWeek,
      startTime,
      endTime,
    );

    if (isOverlapping) {
      throw new Error('The new slot overlaps with an existing slot.');
    }

    return this.prisma.weeklyAvailability.create({
      data: {
        psychologistId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });
  }

  async checkForOverlap(
    psychologistId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const overlappingAvailability =
      await this.prisma.weeklyAvailability.findMany({
        where: {
          psychologistId,
          dayOfWeek,
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          ],
        },
      });

    return overlappingAvailability.length > 0;
  }

  async updateAvailability(id: number, startTime: string, endTime: string) {
    return this.prisma.weeklyAvailability.update({
      where: { id },
      data: { startTime, endTime },
    });
  }

  async deleteAvailability(id: number) {
    return this.prisma.weeklyAvailability.delete({
      where: { id },
    });
  }
}
