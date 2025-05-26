// components/Dashboard/KPICards.tsx
interface Stats {
  moodEntries: number;
  meetings: number;
}

export default function KPICards({ stats }: { stats: Stats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ваша активність
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {stats.moodEntries}
          </p>
          <p className="text-gray-600 text-sm mt-1">Записи настрою</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{stats.meetings}</p>
          <p className="text-gray-600 text-sm mt-1">Зустрічі</p>
        </div>
      </div>
    </div>
  );
}
