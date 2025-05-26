// services/moodService.ts
import apiClient from "@/lib/apiClient";
import { MoodEntry } from "./moodTypes";

export const moodService = {
  async createMoodEntry(entry: Omit<MoodEntry, "id">): Promise<MoodEntry> {
    const res = await apiClient.post(`/mood`, entry);
    return res.data;
  },

  async getMoodEntries(): Promise<MoodEntry[]> {
    const res = await apiClient.get(`/mood`);
    return res.data;
  },

  async getMoodEntryById(id: string): Promise<MoodEntry | null> {
    const res = await apiClient.get(`/mood/${id}`);
    return res.data;
  },

  async updateMoodEntry(
    id: string,
    updates: Partial<MoodEntry>
  ): Promise<MoodEntry> {
    const res = await apiClient.patch(`/mood/${id}`, updates);
    return res.data;
  },

  async deleteMoodEntry(id: string): Promise<void> {
    await apiClient.delete(`/mood/${id}`);
  },
};
