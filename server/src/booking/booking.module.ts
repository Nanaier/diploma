import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { NotificationModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
