// src/notifications/notifications.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType, ResponseStatus } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createNotification(data: {
    userId: number;
    message: string;
    type: NotificationType;
    eventId?: number;
    responseStatus?: ResponseStatus;
    bookingId?: number;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        message: data.message,
        type: data.type,
        userId: data.userId,
        eventId: data.eventId,
        bookingId: data.bookingId,
        response: data.responseStatus,
      },
    });

    // Send real-time notification
    this.notificationsGateway.sendNotification(data.userId, notification);

    return notification;
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserUnreadNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleMeetingResponse(
    notificationId: number,
    response: ResponseStatus,
  ) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId as number },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    console.log(notification);

    const booking = await this.prisma.booking.findUnique({
      where: { id: notification.bookingId as number },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { id: booking.psychologistId },
      include: { user: true },
    });

    if (!psychologist) {
      throw new NotFoundException('Psychologist not found');
    }

    if (response === ResponseStatus.ACCEPTED) {
      const overlappingBooking = await this.prisma.booking.findFirst({
        where: {
          psychologistId: booking.psychologistId,
          status: 'CONFIRMED',
          // Overlapping time logic
          OR: [
            {
              startTime: { lte: booking.startTime },
              endTime: { gt: booking.startTime },
            },
            {
              startTime: { lt: booking.endTime },
              endTime: { gte: booking.endTime },
            },
            {
              startTime: { gte: booking.startTime },
              endTime: { lte: booking.endTime },
            },
          ],
        },
      });

      if (overlappingBooking) {
        throw new Error(
          `This slot is already booked. Please choose a different time.`,
        );
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      });

      const event = await this.prisma.event.create({
        data: {
          title: `Сесія з вашим психологом`,
          description: 'Затверджена сесія.',
          start: booking.startTime,
          end: booking.endTime,
          userId: booking.userId,
          createdById: psychologist.userId,
          type: 'MEETING',
        },
      });

      const psychEvent = await this.prisma.event.create({
        data: {
          title: 'Сесія з вашим клієнтом',
          description: 'Затверджена сесія.',
          start: booking.startTime,
          end: booking.endTime,
          userId: psychologist.userId,
          createdById: psychologist.userId, // or booking.userId if you prefer
          type: 'MEETING',
        },
      });

      const existingPsychologistOnUser =
        await this.prisma.psychologistOnUser.findUnique({
          where: {
            psychologistId_userId: {
              psychologistId: psychologist.id,
              userId: booking.userId,
            },
          },
        });

      if (!existingPsychologistOnUser) {
        await this.prisma.psychologistOnUser.create({
          data: {
            psychologistId: psychologist.id,
            userId: booking.userId,
          },
        });
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { eventId: event.id, psychEventId: psychEvent.id },
      });

      await this.createNotification({
        userId: booking.userId,
        message: `Ваше бронування з ${psychologist.user.displayName} було затверджено на ${booking.startTime.toLocaleString()}`,
        type: NotificationType.EVENT_UPDATED,
        eventId: event.id,
      });
    } else if (response === ResponseStatus.DENIED) {
      // 1. Update the booking status to CANCELLED
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });

      // 2. Notify the user that the booking was rejected
      await this.createNotification({
        userId: booking.userId,
        message: `Ваше бронування було відхилено. Будь ласка виберіть інший час.`,
        type: NotificationType.EVENT_UPDATED,
      });
    }

    const notif = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { response },
    });

    return notif;
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, userId }, // Ensure user owns the notification
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async scheduleEventReminder(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      this.logger.warn(`Event ${eventId} not found for reminder scheduling`);
      return;
    }

    const reminderTime = new Date(event.start);
    reminderTime.setMinutes(reminderTime.getMinutes() - 10);

    // Don't schedule if the event is in the past
    if (reminderTime < new Date()) {
      this.logger.log(
        `Event ${eventId} is in the past, not scheduling reminder`,
      );
      return;
    }

    const jobName = `event-reminder-${eventId}`;

    // Remove existing job if it exists
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    const job = new CronJob(reminderTime, async () => {
      await this.createNotification({
        userId: event.userId,
        message: `Нагадування: "${event.title}" починається через 10 хвилин`,
        type: 'EVENT_REMINDER',
        eventId: event.id,
      });
      this.logger.log(`Sent reminder for event ${eventId}`);
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(
      `Scheduled reminder for event ${eventId} at ${reminderTime}`,
    );
  }

  async cancelScheduledReminder(eventId: number) {
    const jobName = `event-reminder-${eventId}`;
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`Cancelled reminder for event ${eventId}`);
    }
  }

  async cancelAllScheduledRemindersForUser(userId: number) {
    const futureEvents = await this.prisma.event.findMany({
      where: {
        OR: [{ userId }, { createdById: userId }],
        start: { gt: new Date() }, // Only future events
      },
    });

    // Cancel each scheduled reminder
    for (const event of futureEvents) {
      await this.cancelScheduledReminder(event.id);
    }

    this.logger.log(`Cancelled all reminders for user ${userId}`);
  }

  async rescheduleAllReminders() {
    this.logger.log('Rescheduling all event reminders...');

    // Get all future events
    const futureEvents = await this.prisma.event.findMany({
      where: {
        start: {
          gt: new Date(),
        },
      },
    });

    // Schedule reminders for each event
    for (const event of futureEvents) {
      await this.scheduleEventReminder(event.id);
    }

    this.logger.log(`Rescheduled ${futureEvents.length} event reminders`);
  }
}
