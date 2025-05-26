// app/psychologist/rejected/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useError } from "@/contexts/ErrorContext";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RejectedApprovalPage() {
  const { logout, initialized } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { setError } = useError();

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!initialized) return <LoadingSpinner />;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await apiClient.delete("/auth/me");
      logout();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Failed to delete account", err);
      setError(err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["psychologist"]}
      allowedStatuses={["rejected"]}
    >
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-5 text-gray-800">
          Заявку відхилено
        </h1>
        <div className="mb-8 space-y-3 text-gray-600">
          <p>На жаль, ваша заявка була відхилена.</p>
        </div>
        <div className="space-y-5">
          <p className="text-gray-600">
            Ви можете увійти в систему з обмеженим доступом або видалити свій
            акаунт.
          </p>

          <div className="flex justify-center gap-5 pt-5 pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              Вийти
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors shadow-sm"
            >
              {t("Видалити мій обліковий запис")}
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {t("Підтвердження видалення акаунта")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                "Ви впевнені, що хочете назавжди видалити свій обліковий запис? Цю дію не можна скасувати."
              )}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("Скасувати")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors shadow-sm"
              >
                {deleting ? t("Видалення...") : t("Видалити акаунт")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
