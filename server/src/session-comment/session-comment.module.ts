import { Module } from '@nestjs/common';

import { PrismaModule } from 'prisma/prisma.module';
import { SessionCommentService } from './session-comment.service';
import { SessionCommentController } from './session-comment.controller';
import { TaggingModule } from 'src/tagging/tagging.module';

@Module({
  imports: [PrismaModule, TaggingModule],
  providers: [SessionCommentService],
  controllers: [SessionCommentController],
})
export class SessionCommentModule {}
