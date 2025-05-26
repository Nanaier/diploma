// components/MoodInput.tsx
import React, { useState } from "react";
import { MoodValue } from "./moodTypes";

interface MoodInputProps {
  onSubmit: (mood: MoodValue, notes?: string) => void;
  disabled?: boolean;
}

const MoodInput: React.FC<MoodInputProps> = ({ onSubmit, disabled }) => {
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [notes, setNotes] = useState("");

  const moodOptions = [
    {
      value: 1,
      label: "Дуже погано",
      emoji: "😢",
      color: "bg-red-100 text-red-800",
    },
    {
      value: 2,
      label: "Погано",
      emoji: "😞",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: 3,
      label: "Нормально",
      emoji: "😐",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: 4,
      label: "Добре",
      emoji: "😊",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: 5,
      label: "Чудово",
      emoji: "😁",
      color: "bg-green-100 text-green-800",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    await onSubmit(selectedMood, notes.trim() || undefined);
    setSelectedMood(null);
    setNotes("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Як ви себе почуваєте сьогодні?
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                selectedMood === option.value
                  ? `${option.color} scale-105 shadow-md`
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedMood(option.value)}
              disabled={disabled}
            >
              <span className="text-2xl mb-1">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label
            htmlFor="mood-notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Нотатки (необов'язково)
          </label>
          <textarea
            id="mood-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Що впливає на ваш настрій сьогодні?"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedMood || disabled}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            disabled
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {disabled ? "Зберігаємо..." : "Зберегти настрій"}
        </button>
      </form>
    </div>
  );
};

export default MoodInput;
