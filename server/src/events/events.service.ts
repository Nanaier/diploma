// src/events/events.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createEventDto: CreateEventDto, creatorId: number) {
    console.log(createEventDto);
    const startDate = new Date(createEventDto.start);
    const endDate = new Date(createEventDto.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Cannot create events in the past');
    }

    // First verify both users exist
    const [targetUser, creator, exercise] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: createEventDto.userId } }),
      this.prisma.user.findUnique({ where: { id: creatorId } }),
      createEventDto.exerciseId
        ? this.prisma.exercise.findUnique({
            where: { id: createEventDto.exerciseId },
          })
        : Promise.resolve(null),
      ,
    ]);

    if (!targetUser) {
      throw new NotFoundException(
        `User with ID ${createEventDto.userId} not found`,
      );
    }
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${creatorId} not found`);
    }

    if (createEventDto.exerciseId && !exercise) {
      throw new NotFoundException(
        `Exercise with ID ${createEventDto.exerciseId} not found`,
      );
    }

    const eventIncludeOptions = {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },
      createdBy: true,
      exercise: true,
      Booking: true,
      psychologistBookings: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    };

    console.log(createEventDto);

    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        start: startDate,
        end: endDate,
        allDay: createEventDto.allDay || false,
        color: createEventDto.color,
        location: createEventDto.location,
        type: createEventDto.type || 'CUSTOM',
        user: {
          connect: { id: createEventDto.userId },
        },
        createdBy: {
          connect: { id: creatorId },
        },
        ...(createEventDto.exerciseId
          ? {
              exercise: {
                connect: { id: createEventDto.exerciseId },
              },
            }
          : {}),
      },
      include: eventIncludeOptions,
    });

    await this.notificationsService.scheduleEventReminder(event.id);

    await this.notificationsService.createNotification({
      userId: createEventDto.userId,
      message: `Подія була створена: "${event.title}"`,
      type: 'EVENT_CREATED',
      eventId: event.id,
    });

    return event;
  }

  async update(id: number, updateEventDto: any, userId: number) {
    console.log(id, updateEventDto, userId);
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: true,
        Booking: true,
        psychologistBookings: true,
        user: true,
      },
    });

    console.log(event);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Користувач може редагувати свої події, які не пов'язані з бронюванням
    if (event.userId === userId && event.type !== 'MEETING') {
      return this.updateEventWithChecks(id, updateEventDto);
    }

    // // Психолог може редагувати свої власні події
    // if (
    //   event.user.role === 'psychologist' &&
    //   event.createdById === userId &&
    //   event.userId === userId &&
    //   event.type !== 'MEETING'
    // ) {
    //   return this.updateEventWithChecks(id, updateEventDto);
    // }

    // Психолог може оновити лише локацію для подій, створених для користувачів (букінгів)
    if (
      event.user.role === 'psychologist' &&
      event.createdBy.id === userId &&
      event.type === 'MEETING'
    ) {
      const secondEventId =
        event.Booking.length > 0
          ? event.Booking[0].psychEventId
          : event.psychologistBookings[0].eventId;

      await this.prisma.event.update({
        where: { id },
        data: { location: updateEventDto.location },
      });

      return this.prisma.event.update({
        where: { id: secondEventId as number },
        data: { location: updateEventDto.location },
      });
    }

    throw new ForbiddenException(
      'You do not have permission to edit this event',
    );
  }

  private async updateEventWithChecks(id: number, updateEventDto: any) {
    if (updateEventDto.start && updateEventDto.end) {
      const startDate = new Date(updateEventDto.start);
      const endDate = new Date(updateEventDto.end);

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Cannot move events to the past');
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });

    // Переносимо нагадування, якщо змінився час
    if (updateEventDto.start) {
      await this.notificationsService.cancelScheduledReminder(id);
      await this.notificationsService.scheduleEventReminder(id);
    }

    return updatedEvent;
  }

  async remove(id: number, userId: number) {
    // Cancel any scheduled reminder
    await this.notificationsService.cancelScheduledReminder(id);

    return this.prisma.event.delete({
      where: { id, userId }, // Ensure user owns the event
    });
  }

  async findUpcomingForUser(requestingUser: any, targetUserId: number) {
    const includeOptions = {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },
      createdBy: true,
      exercise: true,
      Booking: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
      psychologistBookings: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    };

    // If the user is requesting their own events, allow
    if (requestingUser.id === targetUserId) {
      console.log(targetUserId);
      const events = this.prisma.event.findMany({
        where: {
          userId: targetUserId,
          start: {
            gte: new Date(),
          },
        },
        orderBy: { start: 'asc' },
        include: includeOptions,
      });
      console.log(events);

      return events;
    }

    // If requestingUser is a psychologist, check if assigned to targetUserId
    if (requestingUser.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({
        where: { userId: requestingUser.id },
        select: { id: true },
      });

      if (!psychologist) {
        throw new NotFoundException('Psychologist not found');
      }

      const isAssigned = await this.prisma.psychologistOnUser.findFirst({
        where: {
          psychologistId: psychologist.id,
          userId: targetUserId,
          dataStatus: 'approved',
        },
      });

      if (isAssigned) {
        return this.prisma.event.findMany({
          where: {
            userId: targetUserId,
            start: {
              gte: new Date(),
            },
          },
          orderBy: { start: 'asc' },
          include: includeOptions,
        });
      }

      throw new NotFoundException('Access denied: Not assigned to this user');
    }

    // Admins can view any events
    if (requestingUser.role === 'admin') {
      return this.prisma.event.findMany({
        where: {
          userId: targetUserId,
          start: {
            gte: new Date(),
          },
        },
        orderBy: { start: 'asc' },
        include: includeOptions,
      });
    }

    throw new NotFoundException('Access denied');
  }

  async findForUser(requestingUser: any, targetUserId: number) {
    const includeOptions = {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },
      createdBy: true,
      exercise: true,
      SessionComment: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
      Booking: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
      psychologistBookings: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    };

    // If the user is requesting their own events, allow
    if (requestingUser.id === targetUserId) {
      console.log(targetUserId);
      const events = await this.prisma.event.findMany({
        where: { userId: targetUserId },
        orderBy: { start: 'asc' },
        include: includeOptions,
      });
      console.log(events);

      return events;
    }

    // If requestingUser is a psychologist, check if assigned to targetUserId
    if (requestingUser.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({
        where: { userId: requestingUser.id },
        select: { id: true },
      });

      if (!psychologist) {
        throw new NotFoundException('Psychologist not found');
      }

      const isAssigned = await this.prisma.psychologistOnUser.findFirst({
        where: {
          psychologistId: psychologist.id,
          userId: targetUserId,
          dataStatus: 'approved',
        },
      });

      if (isAssigned) {
        return await this.prisma.event.findMany({
          where: { userId: targetUserId },
          orderBy: { start: 'asc' },
          include: includeOptions,
        });
      }

      throw new NotFoundException('Access denied: Not assigned to this user');
    }

    // Admins can view any events
    if (requestingUser.role === 'admin') {
      return await this.prisma.event.findMany({
        where: { userId: targetUserId },
        orderBy: { start: 'asc' },
        include: includeOptions,
      });
    }

    throw new NotFoundException('Access denied');
  }
}
