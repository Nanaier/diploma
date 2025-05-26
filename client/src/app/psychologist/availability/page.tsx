"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApprovedPsychologistGuard } from "@/components/PsychologistRouteGuard";
import { FiTrash2, FiPlus, FiCalendar } from "react-icons/fi";
import { useError } from "@/contexts/ErrorContext";
import { TimePicker } from "@/components/Calendar/TimePicker";

interface Availability {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const days = [
  { id: 1, name: "Понеділок" },
  { id: 2, name: "Вівторок" },
  { id: 3, name: "Середа" },
  { id: 4, name: "Четвер" },
  { id: 5, name: "П'ятниця" },
  { id: 6, name: "Субота" },
  { id: 0, name: "Неділя" },
];

export default function ManageAvailability() {
  const { user, initialized } = useAuth();
  const { setError } = useError();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Default to Monday
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.Psychologist) {
      fetchAvailability(user.Psychologist.id);
    }
  }, [user]);

  const fetchAvailability = async (psychologistId: number) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Availability[]>(
        `/availability/me/${psychologistId}`
      );
      setAvailability(res.data);
    } catch (error) {
      setError("Не вдалося завантажити доступність");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!startTime || !endTime) {
      setError("Будь ласка, вкажіть час початку та завершення");
      return;
    }

    if (startTime >= endTime) {
      setError("Час завершення має бути пізніше за час початку");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/availability", {
        psychologistId: user?.Psychologist?.id,
        dayOfWeek,
        startTime,
        endTime,
      });
      fetchAvailability(user?.Psychologist?.id as number);
      setStartTime("09:00");
      setEndTime("17:00");
    } catch (error) {
      setError(
        "Не вдалося додати слот. Можливо, він перетинається з існуючим."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Ви впевнені, що хочете видалити цей слот?")) {
      setIsLoading(true);
      try {
        await apiClient.delete(`/availability/${id}`);

        fetchAvailability(user?.Psychologist?.id as number);
      } catch (error) {
        setError("Не вдалося видалити слот");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!initialized) return <LoadingSpinner />;

  return (
    <ApprovedPsychologistGuard>
      <ProtectedRoute
        allowedRoles={["psychologist"]}
        allowedStatuses={["approved"]}
      >
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Керування доступністю
            </h1>
            <p className="text-gray-600">
              Тут ви можете встановити години, коли ви доступні для консультацій
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Додати новий слот
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  День тижня
                </label>
                <div className="relative">
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                  >
                    {days.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Початок
                </label>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  interval={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Кінець
                </label>
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  interval={15}
                  minTime={startTime}
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FiPlus className="mr-2" />
              Додати слот
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Ваша поточна доступність
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : availability.length === 0 ? (
              <div className="text-center py-8">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Немає доданих слотів
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Додайте свої робочі години вище
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availability.map((slot) => (
                  <li
                    key={slot.id}
                    className="py-4 px-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiCalendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {days.find((d) => d.id === slot.dayOfWeek)?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        title="Видалити"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </ApprovedPsychologistGuard>
  );
}
