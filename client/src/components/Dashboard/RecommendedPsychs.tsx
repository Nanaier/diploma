import { useRouter } from "next/navigation";

export default function RecommendedPsychologists({
  psychs,
}: {
  psychs: any[];
}) {
  const router = useRouter();

  const handlePsychsClick = () => {
    router.push("/psychologists");
  };

  const handleBookPsychClick = (psychologist: any) => {
    router.push(`/psychologists/${psychologist?.id}`);
  };

  const handleFillProfileClick = () => {
    router.push("/me");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Рекомендовані спеціалісти
        </h3>
        {psychs.length > 0 && (
          <button
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
            onClick={handlePsychsClick}
          >
            Всі спеціалісти
          </button>
        )}
      </div>

      {psychs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {psychs.map((psychologist, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-lg p-4 hover:shadow transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {psychologist.avatarUrl ? (
                    <img
                      src={psychologist.avatarUrl}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl font-bold text-blue-800">
                      {psychologist.user.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    {psychologist.user.displayName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {psychologist.specialty || "Спеціалізація не вказана"}
                  </p>
                  <button
                    className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mt-2"
                    onClick={() => handleBookPsychClick(psychologist)}
                  >
                    Забронювати заняття
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Наразі ми не можемо запропонувати рекомендації. Будь ласка,
            заповніть детальнішу інформацію у своєму профілі, щоб ми могли
            підібрати найкращих спеціалістів для вас.
          </p>
          <button
            onClick={handleFillProfileClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Заповнити профіль
          </button>
        </div>
      )}
    </div>
  );
}
