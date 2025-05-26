import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PsychRoleGuard } from 'src/auth/psych-role.guard';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('me/:psychologistId')
  @UseGuards(PsychRoleGuard)
  async getMyAvailability(@Param('psychologistId') psychologistId: string) {
    return this.availabilityService.getMyAvailability(Number(psychologistId));
  }

  @Post()
  @UseGuards(PsychRoleGuard)
  async create(
    @Body()
    body: {
      psychologistId: number;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    },
  ) {
    return this.availabilityService.createAvailability(
      body.psychologistId,
      body.dayOfWeek,
      body.startTime,
      body.endTime,
    );
  }

  @Put(':id')
  @UseGuards(PsychRoleGuard)
  async update(
    @Param('id') id: string,
    @Body() body: { startTime: string; endTime: string },
  ) {
    return this.availabilityService.updateAvailability(
      Number(id),
      body.startTime,
      body.endTime,
    );
  }

  @Get('checkOverlap')
  @UseGuards(PsychRoleGuard)
  async checkOverlap(
    @Query('psychologistId') psychologistId: number,
    @Query('dayOfWeek') dayOfWeek: number,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const isOverlapping = await this.availabilityService.checkForOverlap(
      +psychologistId,
      +dayOfWeek,
      startTime,
      endTime,
    );

    return { isOverlapping };
  }

  @Delete(':id')
  @UseGuards(PsychRoleGuard)
  async delete(@Param('id') id: string) {
    return this.availabilityService.deleteAvailability(Number(id));
  }
}
