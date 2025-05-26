// src/events/dto/create-event.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Validate,
} from 'class-validator';
import { EventType } from '@prisma/client';
import { IsAfter } from '../validators/is-after.validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  start: string;

  @IsDateString()
  @Validate(IsAfter, ['start'])
  end: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsInt()
  userId: number; // whose calendar this belongs to

  @IsOptional()
  @IsInt()
  exerciseId?: number;
}
