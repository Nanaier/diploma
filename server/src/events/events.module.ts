import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { NotificationModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
