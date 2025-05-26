/* eslint-disable @typescript-eslint/no-unused-vars */
// app/psychologist/complete-profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useError } from "@/contexts/ErrorContext";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CompleteProfileGuard } from "@/components/PsychologistRouteGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const SPECIALTIES = [
  "Психолог",
  "Психотерапевт",
  "Клінічний психолог",
  "Психіатр",
  "Невролог",
];

export default function CompleteProfilePage() {
  const [description, setDescription] = useState("");
  const [certification, setCertification] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const { t } = useLanguage();
  const minWords = 50;

  const router = useRouter();
  const { setError } = useError();
  const { user, logout, initialized, refreshUser } = useAuth();

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    setDescription(text);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\+?[0-9]*$/.test(value) || value === "") {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wordCount < minWords) {
      setError(new Error(`Опис має містити щонайменше ${minWords} слів`));
      return;
    }

    if (!specialty) {
      setError(new Error("Будь ласка, оберіть спеціалізацію"));
      return;
    }

    if (!phoneNumber) {
      setError(new Error("Будь ласка, введіть номер телефону"));
      return;
    }

    if (phoneNumber.length < 10) {
      setError(new Error("Номер телефону має містити щонайменше 10 цифр"));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("specialty", specialty);
      formData.append("phoneNumber", phoneNumber);
      if (certification) formData.append("certification", certification);
      if (avatar) formData.append("avatar", avatar);

      console.log(certification, avatar);

      await apiClient.post("/psychologist/complete-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSubmitting(true);
      await refreshUser();

      router.push("/psychologist/pending");
    } catch (error) {
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialized) return <LoadingSpinner />;

  return (
    <CompleteProfileGuard>
      <ProtectedRoute
        allowedRoles={["psychologist"]}
        allowedStatuses={["needs_profile"]}
      >
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-3 text-gray-800">
              Завершення професійного профілю
            </h1>
            <p className="text-gray-600">
              Будь ласка, надайте свої професійні дані для завершення
              реєстрації.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Фото профілю
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Спеціалізація *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Оберіть спеціалізацію</option>
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Номер телефону *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="+380XXXXXXXXX"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {"Введіть ваш номер телефону для зв'язку"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                {t("Професійний опис")} ({wordCount}/{minWords} слів)
              </label>
              <textarea
                placeholder={t(
                  "Опишіть свою практику, підхід та досвід (мінімум 50 слів)"
                )}
                value={description}
                onChange={handleDescriptionChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-40"
              />
              {wordCount < minWords && (
                <p className="text-red-500 text-sm mt-1">
                  {t(`Мінімум ${minWords} слів обов'язково`)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                {t("Завантаження сертифікату")}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setCertification(e.target.files?.[0] || null)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-40"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t(
                  "Завантажте скан свого професійного сертифікату (PDF, JPG, PNG)"
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || wordCount < minWords}
              className="w-full bg-blue-600 cursor-pointer text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-md"
            >
              {isSubmitting ? t("Відправка...") : t("Надіслати заявку")}
            </button>
          </form>
        </div>
      </ProtectedRoute>
    </CompleteProfileGuard>
  );
}
