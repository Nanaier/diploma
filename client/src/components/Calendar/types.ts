import { User } from "@/contexts/AuthContext";

export type Event = {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
  type?: "CUSTOM" | "MEETING" | "MEDITATION" | "EXERCISE";
  createdById?: number;
  userId?: number;
  exerciseId?: number;
};

export type CalendarProps = {
  assignedUsers: User[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableExercises: any[];
  events: Event[];
  isPsychologist: boolean;
  user: User | null;
};
