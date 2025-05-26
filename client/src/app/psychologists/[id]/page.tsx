"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  dateFnsLocalizer,
  Event,
  ToolbarProps,
  View,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog } from "@headlessui/react";
import { useLanguage } from "@/contexts/LanguageContext";
import "./calendar-styles.css";
import { useError } from "@/contexts/ErrorContext";
import { RouteGuard } from "@/components/RouteGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

const locales = {
  "uk-UA": uk,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Psychologist {
  id: number;
  user: {
    id: number;
    displayName: string;
    email: string;
    createdAt: string;
  };
  description: string;
  certUrl: string;
  specialty: string;
  avatarUrl?: string;
}

interface Slot {
  startTime: string;
  endTime: string;
}

interface SlotEvent extends Event {
  start: Date;
  end: Date;
  title: string;
}

export default function PsychologistProfilePage() {
  const { initialized } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const { setError } = useError();
  const [selectedSlot, setSelectedSlot] = useState<SlotEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);

  const eventStyleGetter = () => {
    const backgroundColor = "#4285F4";
    const style = {
      backgroundColor,
      borderRadius: "4px",
      opacity: 0.5,
      color: "white",
      border: "1px",
      display: "block",
    };
    return {
      style,
    };
  };

  useEffect(() => {
    if (initialized && id) {
      fetchPsychologist(id);
      fetchAvailability(id);
    }
  }, [id, initialized]);

  const fetchPsychologist = async (psychologistId: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get<Psychologist>(
        `/psychologist/${psychologistId}`
      );
      setPsychologist(res.data);
    } catch (error) {
      setError(error);
      console.error("Не вдалося завантажити профіль психолога", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (psychologistId: string) => {
    try {
      const res = await apiClient.get<Slot[]>(
        `/booking/psychologist/${psychologistId}/availability`
      );
      setSlots(res.data);
    } catch (error) {
      setError(error);
      console.error("Не вдалося завантажити доступні слоти", error);
    }
  };

  const handleSelectEvent = (slot: SlotEvent) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      await apiClient.post("/booking", {
        psychologistId: Number(id),
        startTime: selectedSlot.start.toISOString(),
        endTime: selectedSlot.end.toISOString(),
      });
      setIsModalOpen(false);
    } catch (error) {
      setError(error);
      console.error("Помилка бронювання", error);
    }
  };

  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  const shouldTruncate = (text: string) => {
    return text.split(/\s+/).length > 50;
  };

  const truncateText = (text: string) => {
    const words = text.split(/\s+/);
    return words.slice(0, 50).join(" ") + "...";
  };

  if (loading || !psychologist) {
    return <LoadingSpinner />;
  }

  const events: SlotEvent[] = slots.map((slot) => ({
    start: new Date(slot.startTime),
    end: new Date(slot.endTime),
    title: "Available",
  }));

  const displayDescription =
    shouldTruncate(psychologist.description) && !expandedDescription
      ? truncateText(psychologist.description)
      : psychologist.description;

  return (
    <RouteGuard auth redirect="/auth/login">
      <div className="max-w-5xl mx-auto p-6">
        {/* Psychologist Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            {psychologist.avatarUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <Image
                  src={psychologist.avatarUrl}
                  alt={`${psychologist.user.displayName}'s avatar`}
                  fill
                  className="rounded-full object-cover"
                  sizes="(max-width: 768px) 64px, 64px"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                {psychologist.user.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {psychologist.user.displayName}
            </h1>
            <p className="text-gray-500 mb-2">{psychologist.user.email}</p>
            <p className="text-gray-500 text-sm mb-2">
              Приєднався:{" "}
              {new Date(psychologist.user.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {psychologist.specialty}
              </span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Про себе</h2>
            {psychologist.certUrl && (
              <a
                href={psychologist.certUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
                Переглянути сертифікат
              </a>
            )}
          </div>
          <p className="whitespace-pre-line mb-2">{displayDescription}</p>
          {shouldTruncate(psychologist.description) && (
            <button
              onClick={toggleDescription}
              className="text-blue-600 hover:underline text-sm"
            >
              {expandedDescription ? "Згорнути" : "Розгорнути"}
            </button>
          )}
        </div>

        {/* Calendar Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Доступні сесії</h2>
          {slots.length === 0 ? (
            <p className="text-gray-500">Немає доступних слотів.</p>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              <Calendar
                localizer={localizer}
                events={events}
                defaultView={view}
                culture={"uk-UA"}
                view={view}
                date={date}
                onView={(view: View) => setView(view)}
                onNavigate={(date) => setDate(new Date(date))}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                selectable
                onSelectEvent={handleSelectEvent}
                toolbar={true}
                components={{
                  toolbar: CustomToolbar,
                }}
                className="p-2"
              />
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-lg">
              <Dialog.Title className="text-lg font-bold mb-4">
                Підтвердити бронювання
              </Dialog.Title>
              <p className="mb-4">
                Забронювати сесію на{" "}
                <span className="font-semibold">
                  {selectedSlot?.start.toLocaleString()}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleBook}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Забронювати
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </RouteGuard>
  );
}

// Custom Toolbar Component
function CustomToolbar({
  label,
  onNavigate,
  onView,
}: ToolbarProps<SlotEvent, object>) {
  const { t } = useLanguage();
  return (
    <div className="rbc-toolbar flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          {t("Today")}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <span className="ml-2 text-lg font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onView(Views.DAY)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          {t("Day")}
        </button>
        <button
          type="button"
          onClick={() => onView(Views.WEEK)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          {t("Week")}
        </button>
        <button
          type="button"
          onClick={() => onView(Views.MONTH)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          {t("Month")}
        </button>
      </div>
    </div>
  );
}
