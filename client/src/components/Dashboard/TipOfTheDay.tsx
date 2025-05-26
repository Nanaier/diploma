// components/Dashboard/TipOfTheDay.tsx
const tips = [
  "Зроби глибокий вдих. Повтори тричі.",
  "Виділи 5 хвилин на усвідомлене дихання.",
  "Подякуй собі за маленькі кроки.",
  "Запиши три речі, за які ти вдячний сьогодні.",
  "Зроби перерву та вийди на коротку прогулянку.",
];

export default function TipOfTheDay() {
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6 ">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Порада дня
          </h3>
          <p className="text-gray-700">{tip}</p>
        </div>
      </div>
    </div>
  );
}
