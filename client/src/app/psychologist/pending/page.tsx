// app/psychologist/pending/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PendingApprovalGuard } from "@/components/PsychologistRouteGuard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PendingApprovalPage() {
  const { logout, initialized } = useAuth();
  if (!initialized) return <LoadingSpinner />;

  return (
    <PendingApprovalGuard>
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-5 text-gray-800">
          Заявку надіслано
        </h1>
        <div className="mb-8 space-y-3 text-gray-600">
          <p>Дякуємо за подану заявку.</p>
          <p>
            Наша команда перевірить ваші дані та зв'яжеться з вами найближчим
            часом за вашими наданими даними номеру телефону та пошти.
          </p>
        </div>
        <div className="space-y-5">
          <p className="text-gray-600">
            Ви можете увійти в систему, але ваш доступ буде обмеженим до
            отримання схвалення.
          </p>
          <div className="flex justify-center gap-5 pt-5">
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              Вийти
            </button>
          </div>
        </div>
      </div>
    </PendingApprovalGuard>
  );
}
