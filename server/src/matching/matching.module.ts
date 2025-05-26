import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Module } from 'src/aws/s3.module';

@Module({
  imports: [S3Module],
  controllers: [MatchingController],
  providers: [MatchingService, PrismaService],
})
export class MatchingModule {}
