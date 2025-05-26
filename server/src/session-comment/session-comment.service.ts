// src/session-comment/session-comment.service.ts
import { Injectable } from '@nestjs/common';
import { CreateSessionCommentDto } from './dto/create-session-comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TaggingService } from 'src/tagging/tagging.service';

@Injectable()
export class SessionCommentService {
  constructor(
    private prisma: PrismaService,
    private taggingService: TaggingService,
  ) {}

  async createOrUpdateComment(dto: CreateSessionCommentDto) {
    // Check if comment already exists for this booking
    const existingComment = await this.prisma.sessionComment.findFirst({
      where: {
        eventId: dto.eventId,
      },
    });

    if (existingComment) {
      // Update existing comment
      const comment = await this.prisma.sessionComment.update({
        where: { id: existingComment.id },
        data: {
          comment: dto.comment,
          // You can add exercise tags parsing here later
        },
      });

      console.log(dto.eventId, dto.comment);

      await this.taggingService.processEventCommentTags(
        dto.eventId,
        dto.comment,
      );

      return comment;
    } else {
      // Create new comment
      const comment = await this.prisma.sessionComment.create({
        data: {
          comment: dto.comment,
          eventId: dto.eventId,
          psychologistId: dto.psychologistId,
          userId: dto.userId,
          // Initialize empty exercise tags
          exerciseTags: {},
        },
      });

      console.log(dto.eventId, dto.comment);

      await this.taggingService.processEventCommentTags(
        dto.eventId,
        dto.comment,
      );
      return comment;
    }
  }

  async getCommentByEvent(eventId: number) {
    return this.prisma.sessionComment.findFirst({
      where: { eventId },
    });
  }
}
