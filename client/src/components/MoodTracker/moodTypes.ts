export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodValue;
  notes?: string;
}

export interface MoodChartData {
  date: string;
  mood: MoodValue;
}
