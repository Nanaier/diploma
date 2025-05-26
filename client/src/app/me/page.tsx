"use client";

import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useError } from "@/contexts/ErrorContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FiUser, FiMail, FiPhone, FiShield, FiInfo, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

export default function MePage() {
  const { user, loading, initialized, logout, refreshUser } = useAuth();

  const { t } = useLanguage();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(user?.description || "");
  const [wordCount, setWordCount] = useState(0);
  const minWords = 20;
  const { setError } = useError();

  useEffect(() => {
    if (user?.description) {
      setDescription(user.description);
      updateWordCount(user.description);
    }
  }, [user]);

  const updateWordCount = (text: string) => {
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    setDescription(text);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wordCount < minWords) {
      setError(new Error(`Опис має містити щонайменше ${minWords} слів`));
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch("/user/description", { description });
      await refreshUser();
    } catch (error) {
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleUnassign = async (endpoint: string) => {
    await apiClient.delete(endpoint);
    await refreshUser();
    setRefreshKey((prev) => prev + 1);
  };

  const handleShareData = async (endpoint: string) => {
    await apiClient.patch(endpoint);
    await refreshUser();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  if (!initialized || loading) return <LoadingSpinner />;
  if (!user)
    return <p className="p-6">{t("Not logged in or session expired.")}</p>;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Мій профіль")}
          </h1>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-red-600 hover:text-red-800 transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
            <span>{t("Видалити акаунт")}</span>
          </button>
        </div>

        {/* Account Info Section */}
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-blue-500" />
              {t("Інформація про обліковий запис")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-start">
              <FiMail className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("Пошта")}
                </p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <FiUser className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">{t("Імʼя")}</p>
                <p className="mt-1 text-sm text-gray-900">{user.displayName}</p>
              </div>
            </div>

            {user.Psychologist?.phoneNumber && (
              <div className="flex items-start">
                <FiPhone className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("Номер телефону")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.Psychologist.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <FiShield className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">{t("Роль")}</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FiInfo className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("Статус")}
                </p>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {user.status}
                </p>
              </div>
            </div>
          </div>
        </section>

        {user.role === "user" && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiEdit2 className="w-5 h-5 text-blue-500" />
                {t("Опишіть ваші потреби")}
              </h2>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Опис")} ({wordCount}/{minWords} {t("слів")})
                  </label>
                  <textarea
                    placeholder={t(
                      "Опишіть свої потреби для психолога (мінімум 20 слів)"
                    )}
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out min-h-[120px]"
                  />
                  {wordCount < minWords && (
                    <p className="mt-1 text-sm text-red-600">
                      {t(`Мінімум ${minWords} слів обов'язково`)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || wordCount < minWords}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting || wordCount < minWords
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  } transition duration-150 ease-in-out`}
                >
                  {isSubmitting
                    ? t("Збереження...")
                    : user.description
                    ? t("Оновити опис")
                    : t("Зберегти опис")}
                </button>

                {user.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {t("Ваш поточний опис")}:
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {user.description}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </section>
        )}

        {/* Role-specific sections */}
        {user.role === "user" && user.assignedPsychologists?.length > 0 && (
          <section
            key={`user-section-${refreshKey}`}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("Повʼязані психологи")} ({user.assignedPsychologists.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {user.assignedPsychologists.map((psych) => (
                <div key={psych.user.id} className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <a
                        href={`/psychologists/${psych.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {psych.user.displayName}
                      </a>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            psych.dataStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {psych.dataStatus === "approved"
                            ? t("Доступ дозволено")
                            : t("Очікує підтвердження")}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {psych.dataStatus === "pending" && (
                        <button
                          onClick={() =>
                            handleShareData(
                              `user/psychologist/${psych.id}/shareData`
                            )
                          }
                          className="inline-flex items-center px-3 py-1 cursor-pointer border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FiCheck className="mr-1.5 h-3 w-3" />
                          {t("Дозволити доступ")}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleUnassign(
                            `/psychologist/user/unassign/${psych.id}`
                          )
                        }
                        className="inline-flex items-center px-3 py-1 cursor-pointer border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiX className="mr-1.5 h-3 w-3" />
                        {t("Припинити")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {user.role === "psychologist" && user.assignedUsers?.length > 0 && (
          <section
            key={`psych-section-${refreshKey}`}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("Повʼязані клієнти")} ({user.assignedUsers.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {user.assignedUsers.map((assignedUser) => (
                <div key={assignedUser.id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">
                      {assignedUser.displayName}
                    </span>
                    <button
                      onClick={() =>
                        handleUnassign(
                          `/psychologist/unassign/${assignedUser.id}`
                        )
                      }
                      className="inline-flex items-center px-3 py-1 cursor-pointer border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiX className="mr-1.5 h-3 w-3" />
                      {t("Припинити")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty states */}
        {user.role === "user" &&
          (!user.assignedPsychologists ||
            user.assignedPsychologists.length === 0) && (
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("Повʼязані психологи")}
                </h2>
              </div>
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">
                  {t("Немає повʼязаних психологів")}
                </p>
              </div>
            </section>
          )}

        {user.role === "psychologist" &&
          (!user.assignedUsers || user.assignedUsers.length === 0) && (
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("Повʼязані клієнти")}
                </h2>
              </div>
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">
                  {t("Немає повʼязаних клієнтів")}
                </p>
              </div>
            </section>
          )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("Підтвердження видалення акаунта")}
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600">
                  {t(
                    "Ви впевнені, що хочете назавжди видалити свій обліковий запис? Цю дію не можна скасувати."
                  )}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t("Скасувати")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                >
                  {deleting ? t("Видалення...") : t("Видалити акаунт")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
