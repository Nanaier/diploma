import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as dayjs from 'dayjs';
import { NotificationType, ResponseStatus } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createBooking(
    userId: number,
    psychologistId: number,
    startTime: Date,
    endTime: Date,
  ) {
    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        psychologistId: psychologistId,
        status: 'CONFIRMED',
        // Overlapping time logic
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new Error(
        `This slot is already booked. Please choose a different time.`,
      );
    }
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        psychologistId,
        startTime,
        endTime,
        status: 'PENDING',
      },
    });

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { id: psychologistId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!psychologist) {
      throw new ForbiddenException("Psychologists doesn't exist");
    }

    console.log(psychologist);

    // 3. Send a notification to the user and get the notification ID
    await this.notificationsService.createNotification({
      userId: psychologist.user.id,
      message: `Клієнт забронював зустріч на ${startTime.toLocaleString()}`,
      type: NotificationType.MEETING_INVITE,
      eventId: undefined,
      responseStatus: ResponseStatus.PENDING,
      bookingId: booking.id,
    });

    return booking;
  }

  async getBookingsForPsychologist(psychologistId: number) {
    return this.prisma.booking.findMany({
      where: { psychologistId, status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  // async confirmBooking(bookingId: number, psychologistId: number) {
  //   const booking = await this.prisma.booking.findUnique({
  //     where: { id: bookingId },
  //   });

  //   if (!booking || booking.psychologistId !== psychologistId) {
  //     throw new ForbiddenException('Unauthorized');
  //   }

  //   if (booking.status !== 'PENDING') {
  //     throw new ForbiddenException('Booking already processed');
  //   }

  //   const psychologist = await this.prisma.psychologist.findUnique({
  //     where: { id: psychologistId },
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           displayName: true,
  //           email: true,
  //           createdAt: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!psychologist) {
  //     throw new ForbiddenException('No psychologist for this ID');
  //   }

  //   // 1. Create the Event
  //   const event = await this.prisma.event.create({
  //     data: {
  //       title: 'Session with your psychologist',
  //       description: 'Confirmed session.',
  //       start: booking.startTime,
  //       end: booking.endTime,
  //       userId: booking.userId,
  //       createdById: psychologist.userId, // or booking.userId if you prefer
  //       type: 'MEETING',
  //     },
  //   });

  //   await this.prisma.event.create({
  //     data: {
  //       title: `Session with your client`,
  //       description: 'Confirmed session.',
  //       start: booking.startTime,
  //       end: booking.endTime,
  //       userId: psychologist.userId,
  //       createdById: psychologist.userId, // or booking.userId if you prefer
  //       type: 'MEETING',
  //     },
  //   });

  //   // 2. Update the Booking
  //   await this.prisma.booking.update({
  //     where: { id: booking.id },
  //     data: {
  //       status: 'CONFIRMED',
  //       eventId: event.id,
  //     },
  //   });

  //   // 3. Notify user
  //   await this.prisma.notification.create({
  //     data: {
  //       userId: booking.userId,
  //       message: `Your booking has been confirmed for ${booking.startTime.toLocaleString()}`,
  //       type: NotificationType.EVENT_UPDATED,
  //       eventId: event.id,
  //     },
  //   });

  //   return { success: true };
  // }

  // async rejectBooking(bookingId: number, psychologistId: number) {
  //   const booking = await this.prisma.booking.findUnique({
  //     where: { id: bookingId },
  //   });

  //   if (!booking || booking.psychologistId !== psychologistId) {
  //     throw new ForbiddenException('Unauthorized');
  //   }

  //   if (booking.status !== 'PENDING') {
  //     throw new ForbiddenException('Booking already processed');
  //   }

  //   await this.prisma.booking.update({
  //     where: { id: bookingId },
  //     data: {
  //       status: 'CANCELLED',
  //     },
  //   });

  //   await this.prisma.notification.create({
  //     data: {
  //       userId: booking.userId,
  //       message: `Your booking was rejected. Please select another time.`,
  //       type: NotificationType.EVENT_UPDATED,
  //     },
  //   });

  //   return { success: true };
  // }

  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    });
  }

  async getPsychologistAvailableSlots(psychologistId: number, daysAhead = 14) {
    const bufferMinutes = 10; // <<< NEW
    const sessionMinutes = 60; // <<< SESSION LENGTH

    const weeklyAvailability = await this.prisma.weeklyAvailability.findMany({
      where: { psychologistId },
    });

    const bookings = await this.prisma.booking.findMany({
      where: {
        psychologistId,
        status: 'CONFIRMED',
        startTime: {
          gte: new Date(),
        },
      },
    });

    const slots: any = [];

    for (let i = 0; i < daysAhead; i++) {
      const day = dayjs().add(i, 'day');
      const dow = day.day(); // day of week (0-6)

      const todaysAvailability = weeklyAvailability.filter(
        (a) => a.dayOfWeek === dow,
      );

      for (const avail of todaysAvailability) {
        const [startHour, startMinute] = avail.startTime.split(':').map(Number);
        const [endHour, endMinute] = avail.endTime.split(':').map(Number);

        let slotStart = day.hour(startHour).minute(startMinute).second(0);
        const slotEnd = day.hour(endHour).minute(endMinute).second(0);

        while (slotStart.add(sessionMinutes, 'minute').isBefore(slotEnd)) {
          const sessionEnd = slotStart.add(sessionMinutes, 'minute');

          const conflict = bookings.some(
            (booking) =>
              dayjs(booking.startTime).isBefore(sessionEnd) &&
              dayjs(booking.endTime).isAfter(slotStart),
          );

          if (!conflict) {
            slots.push({
              startTime: slotStart.toISOString(),
              endTime: sessionEnd.toISOString(),
            });
          }

          // Move start to after session + buffer
          slotStart = sessionEnd.add(bufferMinutes, 'minute');
        }
      }
    }

    return slots;
  }
}
