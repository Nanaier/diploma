// src/session-comment/session-comment.controller.ts
import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { SessionCommentService } from './session-comment.service';
import { CreateSessionCommentDto } from './dto/create-session-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('session-comments')
@UseGuards(JwtAuthGuard)
export class SessionCommentController {
  constructor(private readonly commentService: SessionCommentService) {}

  @Post()
  async createOrUpdate(@Body() dto: CreateSessionCommentDto) {
    return this.commentService.createOrUpdateComment(dto);
  }

  @Get('event/:eventId')
  async getByBooking(@Param('eventId') eventId: string) {
    return this.commentService.getCommentByEvent(parseInt(eventId));
  }
}
