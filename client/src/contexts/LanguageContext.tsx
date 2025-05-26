"use client";

import { createContext, useContext, useState } from "react";

type Language = "uk" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "uk",
  setLanguage: () => {},
  t: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("uk");

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Translation dictionary
const translations = {
  uk: {
    "👋 Welcome to PsychSupport": "👋 Ласкаво просимо до PsychSupport",
    "Your mental health companion. Log in or register to get started.":
      "Ваш помічник у питаннях психічного здоров'я. Увійдіть або зареєструйтесь, щоб почати.",
    "Log In": "Увійти",
    "Register as User": "Зареєструватись як Користувач",
    "Register as Psychologist": "Зареєструватись як Психолог",
    "Psychologist Registration": "Зареєструватись як Психолог",
    Today: "Сьогодні",
    Type: "Тип",
    Back: "Назад",
    Next: "Вперед",
    Month: "Місяць",
    Week: "Тиждень",
    Day: "День",
    Agenda: "Розклад",
    Date: "Дата",
    Time: "Час",
    Event: "Подія",
    Title: "Назва",
    "No events in this range": "Немає подій у цьому діапазоні",
    "Create Event": "Створити подію",
    "Event title": "Назва події",
    Start: "Початок",
    End: "Кінець",
    Cancel: "Скасувати",
    Location: "Локація",
    Create: "Створити",
    Description: "Опис",
    "Created by": "Створено",
    "Exercise details": "Деталі вправи",
    "Open exercise": "Відкрити вправу",
    "Booking details": "Деталі бронювання",
    Status: "Статус",
    "Update Location": "Змінити локацію",
    With: "З",
    Close: "Закрити",
    Edit: "Редагувати",
    "Please enter event title": "Будь ласка введіть назву події",
    "End time must be after start time":
      "Час кінця події має бути після початку",
    "Cannot create events in the past": "Не можна створювати події в минулому",
    "All day": "Увесь день",
    "Event type": "Тип події",
    Error: "Помилка",
    "Full Name": "Повне імʼя",
    Name: "Імʼя",
    Email: "Пошта",
    Password: "Пароль",
    Login: "Логін",
    Registrate: "Реєстрація",
  },
  en: {
    "👋 Welcome to PsychSupport": "👋 Welcome to PsychSupport",
    "Your mental health companion. Log in or register to get started.":
      "Your mental health companion. Log in or register to get started.",
    "Log In": "Log In",
    "Register as User": "Register as User",
    "Register as Psychologist": "Register as Psychologist",
    Today: "Today",
    Back: "Back",
    Next: "Next",
    Month: "Month",
    Week: "Week",
    Day: "Day",
    Agenda: "Agenda",
    Date: "Date",
    Time: "Time",
    Event: "Event",
    "No events in this range": "No events in this range",
    "Create Event": "Create Event",
    "Event title": "Event title",
    Start: "Start",
    End: "End",
    Cancel: "Cancel",
    Create: "Create",
    Description: "Description",
    Close: "Close",
    Edit: "Edit",
  },
};
