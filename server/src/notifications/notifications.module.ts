// notification.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationModule implements OnModuleInit {
  constructor(private readonly notificationsService: NotificationsService) {}

  async onModuleInit() {
    // Reschedule all reminders when the module initializes
    await this.notificationsService.rescheduleAllReminders();
  }
}
