// src/events/events.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateEventDto, @Req() req) {
    return this.eventsService.create(dto, req.user.id);
  }

  @Get()
  async getUserEvents(@Req() req, @Query('userId') userIdQuery?: string) {
    const targetUserId = userIdQuery ? parseInt(userIdQuery) : req.user.id;
    return this.eventsService.findForUser(req.user, targetUserId);
  }

  @Get('/upcoming')
  async getUpcomingUserEvents(
    @Req() req,
    @Query('userId') userIdQuery?: string,
  ) {
    const targetUserId = userIdQuery ? parseInt(userIdQuery) : req.user.id;
    return this.eventsService.findUpcomingForUser(req.user, targetUserId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: any, @Req() req) {
    return this.eventsService.update(Number(id), dto, Number(req.user.id));
  }
}
