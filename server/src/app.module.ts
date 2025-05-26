import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notifications/notifications.module';
import { PsychologistModule } from './psychologists/psychologist.module';
import { AdminModule } from './admins/admin.module';
import { BookingModule } from './booking/booking.module';
import { AvailabilityModule } from './availability/availability.module';
import { ExercisesModule } from './exercises/exercises.module';
import { MoodModule } from './mood/mood.module';
import { UserModule } from './user/user.module';
import { MatchingModule } from './matching/matching.module';
import { SessionCommentModule } from './session-comment/session-comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    EventsModule,
    NotificationModule,
    PsychologistModule,
    AdminModule,
    BookingModule,
    AvailabilityModule,
    ExercisesModule,
    MoodModule,
    UserModule,
    MatchingModule,
    SessionCommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
