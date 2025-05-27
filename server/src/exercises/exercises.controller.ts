// src/exercises/exercises.controller.ts
import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'types', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getExercises(
    @Query('types') typesRaw?: string,
    @Query('tags') tagsRaw?: string,
    @Query('search') search?: string,
  ) {
    const types = typesRaw?.split(',').filter(Boolean) ?? [];
    const tags = tagsRaw?.split(',').filter(Boolean) ?? [];

    return this.exercisesService.getExercises({
      types,
      tags,
      search,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getExerciseById(@Param('id') id: string) {
    return this.exercisesService.getExerciseById(id);
  }
}
