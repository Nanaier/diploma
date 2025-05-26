"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        {t("👋 Вітаю у MindHarbor")}
      </h1>
      <p className="mb-6 text-lg text-gray-600">
        {t("Your mental health companion. Log in or register to get started.")}
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <a
          href="/auth/login"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          {t("Log In")}
        </a>
        <a
          href="/auth/register/user"
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-center"
        >
          {t("Register as User")}
        </a>
        <a
          href="/auth/register/psychologist"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
        >
          {t("Register as Psychologist")}
        </a>
      </div>
    </main>
  );
}