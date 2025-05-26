  // notification.entity.ts
  import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

  @Entity()
  export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number; // Just store the user ID directly

    @Column({ nullable: true })
    eventId?: number; // Optional reference to calendar event

    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    type: string; // 'EVENT_REMINDER', 'MEETING_INVITE', etc.
  }
