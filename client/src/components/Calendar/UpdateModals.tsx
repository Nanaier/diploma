// UpdateModals.tsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uk, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";

interface EditEventModalProps {
  event: any;
  onSave: (updatedEvent: any) => void;
  onClose: () => void;
  availableExercises?: any[];
  assignedUsers?: any[];
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  onSave,
  onClose,
  availableExercises = [],
  assignedUsers = [],
}) => {
  const { language } = useLanguage();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isPsychologist = user?.role === "psychologist";

  const [formData, setFormData] = useState({
    id: event.id,
    title: event.title,
    description: event.description || "",
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay || false,
    color: event.color || "#4285F4",
    location: event.location || "",
    type: event.type || "CUSTOM",
    exerciseId: event.exerciseId || undefined,
    userId: event.userId || (isPsychologist ? undefined : user?.id),
  });

  useEffect(() => {
    // Update form data when event prop changes
    setFormData({
      id: event.id,
      title: event.title,
      description: event.description || "",
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay || false,
      color: event.color || "#4285F4",
      location: event.location || "",
      type: event.type || "CUSTOM",
      exerciseId: event.exerciseId || undefined,
      userId: event.userId || (isPsychologist ? undefined : user?.id),
    });
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "type" && value !== "EXERCISE"
        ? { exerciseId: undefined }
        : {}),
    }));
  };

  const handleDateChange = (name: string, date: Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("Редагувати подію")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Title")} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("Event title")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Type")}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOM">{t("Своя подія")}</option>
                  <option value="EXERCISE">{t("Вправа")}</option>
                  {/* <option value="MEDITATION">{t("Meditation")}</option>
                  <option value="MEETING">{t("Meeting")}</option> */}
                </select>
              </div>

              {formData.type === "EXERCISE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Оберіть вправу")}
                  </label>
                  <select
                    name="exerciseId"
                    value={formData.exerciseId || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("Оберіть вправу...")}</option>
                    {availableExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isPsychologist && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Призначити користувачу")}
                  </label>
                  <select
                    name="userId"
                    value={formData.userId || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("Оберіть користувача...")}</option>
                    {assignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName || u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Start")} *
                  </label>
                  <DatePicker
                    selected={formData.start}
                    onChange={(date: Date) => handleDateChange("start", date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="d MMMM yyyy, HH:mm"
                    locale={language === "uk" ? uk : enUS}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("End")} *
                  </label>
                  <DatePicker
                    selected={formData.end}
                    onChange={(date: Date) => handleDateChange("end", date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="d MMMM yyyy, HH:mm"
                    locale={language === "uk" ? uk : enUS}
                    minDate={formData.start}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Description")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Location")}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("Місце проведення або посилання на зустріч")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Колір")}
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                {t("Зберегти зміни")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface EditLocationModalProps {
  location: string;
  onSave: (location: string) => void;
  onClose: () => void;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
  location,
  onSave,
  onClose,
}) => {
  const [newLocation, setNewLocation] = useState(location);
  const { t } = useLanguage();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newLocation);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4"> {t("Оновити локацію")}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Посилання/місце зустрічі")}
            </label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
            >
              {t("Скасувати")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {t("Оновити")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddMeetingCommentModalProps {
  comment: string;
  onSave: (comment: string) => void;
  onClose: () => void;
  selectedEvent: any; // Or use a proper type instead of 'any'
  user: any; // Or use a proper type instead of 'any'
}

export const AddMeetingCommentModal: React.FC<AddMeetingCommentModalProps> = ({
  comment,
  onSave,
  onClose,
  selectedEvent,
  user,
}) => {
  const [newComment, setNewComment] = useState(comment);
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call API to save the comment
      const response = await apiClient.post("/session-comments", {
        comment: newComment,
        eventId: selectedEvent?.id, // Assuming the booking ID is accessible here
        psychologistId: user?.Psychologist.id,
        userId: selectedEvent?.psychologistBookings[0].user?.id,
      });

      if (response.data) {
        onSave(newComment); // Update local state if needed
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {" "}
          {t("Додати коментар до зустрічі")}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Коментар до зустрічі")}
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Додай свій коментар"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
            >
              {t("Скасувати")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {t("Додати")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
