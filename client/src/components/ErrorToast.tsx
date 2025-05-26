// components/ErrorToast.tsx
import React, { useEffect } from "react";
import { useError } from "../contexts/ErrorContext";
import { getErrorMessage } from "@/lib/errorMessages";
import { useLanguage } from "@/contexts/LanguageContext";

const ErrorToast: React.FC = () => {
  const { error, clearError } = useError();
  const { t } = useLanguage();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-red-100 border-l-3 border-red-500 text-red-700 py-2 px-4 shadow-lg">
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-bold">{error.code || t("Error")}</p>
            <p>
              {error.code ? getErrorMessage(error.code, "ua") : error.message}
            </p>
          </div>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
