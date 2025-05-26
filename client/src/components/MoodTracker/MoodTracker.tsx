// components/MoodTracker.tsx
import React, { useState, useEffect } from "react";
import { MoodEntry, MoodValue } from "./moodTypes";
import MoodInput from "./MoodInput";
import MoodHistory from "./MoodHistory";
import MoodStats from "./MoodStats";
import { moodService } from "./moodService";

const MoodTracker: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEntryToday, setHasEntryToday] = useState(false);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const data = await moodService.getMoodEntries();
        setEntries(data);
        const today = new Date().toLocaleDateString();
        setHasEntryToday(
          data.some(
            (entry) => new Date(entry.date).toLocaleDateString() === today
          )
        );
      } catch (err) {
        console.error("Не вдалося завантажити записи", err);
        setError("Не вдалося завантажити записи. Спробуйте ще раз.");
      } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
  }, []);

  const handleAddMood = async (mood: number, notes?: string) => {
    try {
      setIsLoading(true);
      const newEntry = await moodService.createMoodEntry({
        mood: mood as MoodValue,
        notes,
        date: new Date().toISOString(),
      });
      setEntries((prev) => [newEntry, ...prev]);
      setHasEntryToday(true);
    } catch (err: any) {
      console.error("Не вдалося зберегти запис", err);
      setError(
        err.response?.data?.message ||
          "Не вдалося зберегти запис. Спробуйте ще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodStats entries={entries} />
        <MoodHistory entries={entries} isLoading={isLoading} />
      </div>

      {hasEntryToday ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
          Ви вже додали запис сьогодні. Дякуємо!
        </div>
      ) : (
        <MoodInput onSubmit={handleAddMood} disabled={isLoading} />
      )}
    </div>
  );
};

export default MoodTracker;
