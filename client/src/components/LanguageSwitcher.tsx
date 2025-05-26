// components/LanguageSwitcher.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBell } from "./NotificationBell";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-4">
      {/* <div className="flex items-center bg-gray-100 rounded-full p-1">
        <button
          onClick={() => setLanguage("uk")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            language === "uk"
              ? "bg-blue-600 text-white shadow-md"
              : "hover:bg-gray-200"
          }`}
        >
          Українська
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            language === "en"
              ? "bg-blue-600 text-white shadow-md"
              : "hover:bg-gray-200"
          }`}
        >
          English
        </button>
      </div> */}
      <div className="flex items-center">
        <NotificationBell />
      </div>
    </div>
  );
}
