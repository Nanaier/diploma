// src/exercises/dto/exercise.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseType } from '@prisma/client';

export class ExerciseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ExerciseType })
  type: ExerciseType;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ExerciseStepDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  type: string;
}
