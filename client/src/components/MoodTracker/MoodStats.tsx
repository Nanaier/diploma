// components/MoodStats.tsx
import React from "react";
import { MoodEntry } from "./moodTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MoodStatsProps {
  entries: MoodEntry[];
}

const MoodStats: React.FC<MoodStatsProps> = ({ entries }) => {
  const chartData = entries
    .slice(0, 7)
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("uk-UA", {
        month: "short",
        day: "numeric",
      }),
      mood: entry.mood,
    }))
    .reverse();

  const averageMood =
    entries.length > 0
      ? (
          entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length
        ).toFixed(1)
      : "0";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Статистика настрою
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
          <p className="text-gray-600 text-sm">Всього записів</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{averageMood}</p>
          <p className="text-gray-600 text-sm">Середній настрій</p>
        </div>
      </div>

      <h4 className="text-md font-medium text-gray-700 mb-4">
        Останній тренд настрою
      </h4>
      <div className="h-64">
        {entries.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  border: "none",
                }}
                formatter={(value: number) => [`Настрій: ${value}`, ""]}
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4, fill: "#4f46e5" }}
                activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Немає даних для відображення
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodStats;
