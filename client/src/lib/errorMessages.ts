// lib/errorMessages.ts
type ErrorMessages = {
  [key: string]: {
    [lang: string]: string;
  };
};

const errorMessages: ErrorMessages = {
  VALIDATION_ERROR: {
    en: "Validation failed. Please check your input.",
    ua: "Помилка валідації. Будь ласка, перевірте введені дані.",
  },
  NOT_FOUND: {
    en: "Resource not found.",
    ua: "Ресурс не знайдено.",
  },
  // Add more error mappings
};

export const getErrorMessage = (code: string, lang = "en"): string => {
  return (
    errorMessages[code]?.[lang] ||
    errorMessages.DEFAULT?.[lang] ||
    "An error occurred"
  );
};
