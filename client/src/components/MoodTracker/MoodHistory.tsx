// components/MoodHistory.tsx
import React from "react";
import { MoodEntry } from "./moodTypes";

const moodEmojiMap: Record<number, string> = {
  1: "😢",
  2: "😞",
  3: "😐",
  4: "😊",
  5: "😁",
};

interface MoodHistoryProps {
  entries: MoodEntry[];
  isLoading?: boolean;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ entries, isLoading }) => {
  if (isLoading && entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500 text-center py-4">Завантажуємо...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Історія настроїв
        </h3>
        <p className="text-gray-500 text-center py-4">
          Немає записів ще. Додайте запис!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Історія настроїв
      </h3>
      <div className="max-h-96 overflow-y-auto">
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl mr-2">
                      {moodEmojiMap[entry.mood]}
                    </span>
                    <span className="font-medium text-gray-800">
                      {entry.mood}/5
                    </span>
                  </div>
                </div>
                {entry.notes && (
                  <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Є нотатки
                  </div>
                )}
              </div>
              {entry.notes && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {entry.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isLoading && entries.length > 0 && (
        <div className="text-center text-gray-500 mt-4">
          Завантажуємо більше записів...
        </div>
      )}
    </div>
  );
};

export default MoodHistory;
