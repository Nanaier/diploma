import { Injectable } from '@nestjs/common';
import { Exercise, ExerciseType } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

interface GetExercisesParams {
  types?: string[];
  tags?: string[];
  search?: string;
}

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async getExercises(params: GetExercisesParams): Promise<Exercise[]> {
    const { types = [], tags = [], search } = params;

    return this.prisma.exercise.findMany({
      where: {
        AND: [
          types.length > 0 ? { type: { in: types as ExerciseType[] } } : {},
          tags.length > 0
            ? {
                tags: {
                  array_contains: tags,
                },
              }
            : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.prisma.exercise.findUnique({
      where: { id: Number(id) },
    });
  }
}
