import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { PsychologistService } from './psychologist.service';
import { PsychologistController } from './psychologist.controller';
import { NotificationModule } from 'src/notifications/notifications.module';
import { S3Service } from 'src/aws/s3.service';
import { S3Module } from 'src/aws/s3.module';

@Module({
  imports: [PrismaModule, NotificationModule, S3Module],
  providers: [PsychologistService],
  controllers: [PsychologistController],
})
export class PsychologistModule {}
