import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateMoodEntryDto {
  @IsInt()
  @Min(1)
  @Max(5)
  mood: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
