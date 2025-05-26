// types/auth.ts
export type UserRole = "user" | "psychologist" | "admin";
export type UserStatus = "pending" | "approved" | "rejected" | "needs_profile";

export interface BaseUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface PsychologistProfile {
  id: number;
  certUrl: string;
  description: string;
  approved: boolean;
}

export interface UserWithPsychologist extends BaseUser {
  psychologist: PsychologistProfile | null;
}

export interface PsychologistUser extends BaseUser {
  role: "psychologist";
  psychologist: PsychologistProfile;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  eventId?: number;
}

export type NotificationType =
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_REMINDER"
  | "EVENT_CANCELLED"
  | "MEETING_INVITE"
  | "MEETING_REMINDER"
  | "SYSTEM_MESSAGE"
  | "PSYCHOLOGIST_ASSIGNED"
  | "PSYCHOLOGIST_MESSAGE";
