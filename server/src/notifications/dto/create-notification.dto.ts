import { NotificationType } from "@prisma/client";

// src/notifications/dto/create-notification.dto.ts
export class CreateNotificationDto {
  message: string;
  type: NotificationType;
  eventId?: number;
}
