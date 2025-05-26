import { useRouter } from "next/navigation";

export default function RecommendedExercises({
  exercises,
}: {
  exercises: any[];
}) {
  const router = useRouter();
  const handleExercisesClick = () => {
    router.push(`/exercises`);
  };

  const handleExerciseClick = (id: string) => {
    router.push(`/exercises/${id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Рекомендовані вправи
        </h3>
        {exercises.length > 0 && (
          <button
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
            onClick={handleExercisesClick}
          >
            Всі вправи
          </button>
        )}
      </div>

      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-lg p-4 hover:shadow transition-shadow"
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {exercise.type}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{exercise.category}</p>
              <button
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 mt-3 font-medium"
                onClick={() => handleExerciseClick(exercise.id)}
              >
                Почати
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 italic">
            Ваш психолог ще не додав коментарі до занять. Будь ласка,
            дочекайтеся перших рекомендацій після вашої наступної сесії.
          </p>
        </div>
      )}
    </div>
  );
}
