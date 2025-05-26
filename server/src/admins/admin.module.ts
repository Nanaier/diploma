import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { AdminController } from './admin.controller';
import { S3Module } from 'src/aws/s3.module';
import { TaggingModule } from 'src/tagging/tagging.module';

@Module({
  imports: [PrismaModule, S3Module, TaggingModule],
  providers: [],
  controllers: [AdminController],
})
export class AdminModule {}
