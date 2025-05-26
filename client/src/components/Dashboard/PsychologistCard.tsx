import { useRouter } from "next/navigation";

// components/Dashboard/PsychologistCard.tsx
type Psychologist = {
  id: string;
  user: {
    displayName: string;
    email: string;
  };
  specialty?: string;
  avatarUrl?: string;
};

export default function PsychologistCard({
  psychologist,
}: {
  psychologist: Psychologist | null;
}) {
  const router = useRouter();
  const handleBookPsychClick = () => {
    router.push(`/psychologists/${psychologist?.id}`);
  };

  const handleFindPsychClick = () => {
    router.push(`/psychologists`);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">


      {!psychologist ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-2">Психолога ще не призначено</p>
          <button
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
            onClick={handleFindPsychClick}
          >
            Знайти психолога
          </button>
        </div>
      ) : (
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
              onClick={handleBookPsychClick}
            >
              Забронювати заняття
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
