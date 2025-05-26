// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ResponseStatus } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@Req() req) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Get('/unread')
  @UseGuards(JwtAuthGuard)
  async getUserUnreadNotifications(@Req() req) {
    return this.notificationService.getUserUnreadNotifications(req.user.id);
  }

  @Patch(':id/response')
  @UseGuards(JwtAuthGuard)
  async handleMeetingResponse(
    @Param('id') id: string,
    @Body()
    { response }: { response: ResponseStatus },
    @Req() req,
  ) {
    return this.notificationService.handleMeetingResponse(+id, response);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req,
  ) {
    // Ensure the notification is created for the authenticated user
    return this.notificationService.createNotification({
      ...createNotificationDto,
      userId: req.user.id,
    });
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(+id, req.user.id);
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
