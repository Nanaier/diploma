import {
  Calendar,
  dateFnsLocalizer,
  ToolbarProps,
  View,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useError } from "../../contexts/ErrorContext";
import apiClient from "../../lib/apiClient";
import "./calendar-styles.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, User } from "@/contexts/AuthContext";
import { EditEventModal, EditLocationModal } from "./UpdateModals";

const locales = {
  "uk-UA": uk,
};

type Event = {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
  type?: "CUSTOM" | "MEETING" | "MEDITATION" | "EXERCISE";
  createdById?: number;
  createdBy?: object;
  userId?: number;
  exerciseId?: number;
  user?: object;
  exercise?: object;
  Booking?: object[];
  psychologistBookings?: object[];
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export const toLocalISOString = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");

  return (
    new Date(date.getTime() - tzOffset * 60000).toISOString().slice(0, -1) +
    diff +
    pad(tzOffset / 60) +
    ":" +
    pad(tzOffset % 60)
  );
};

export const parseLocalDate = (dateString: string) => {
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + tzOffset);
};

export default function CalendarComponent() {
  const { setError } = useError();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [locale, setLocale] = useState(uk);
  const [events, setEvents] = useState<Event[]>([]);
  const isPsychologist = user?.role === "psychologist";
  const [view, setView] = useState<View>(Views.WEEK);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [date, setDate] = useState(new Date());
  const [availableExercises, setAvailableExercises] = useState<any>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start: new Date(),
    end: new Date(),
  });

  const formats = {
    timeGutterFormat: "HH:mm",
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, "HH:mm", { locale })} - ${format(end, "HH:mm", {
        locale,
      })}`,
    dateFormat: "d",
    dayFormat: "d EEE",
    weekdayFormat: "EEE",
    monthHeaderFormat: "LLLL yyyy",
    dayHeaderFormat: "EEEE, d MMMM",
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, "d MMMM", { locale })} - ${format(end, "d MMMM", {
        locale,
      })}`,
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await apiClient.get("/exercises");
        setAvailableExercises(res.data);
      } catch (err) {
        setError(err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/psychologist/users");
        setAssignedUsers(res.data);
        console.log(res.data);
      } catch (err) {
        setError(err);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await apiClient.get("/events");
        const data = await res.data;

        console.log(data);
        const formatted = data.map((event: Event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: event.allDay ?? false,
          color: event.color,
          description: event.description,
          location: event.location,
          exerciseId: event.exerciseId,
          type: event.type,
          createdBy: event.createdBy,
          user: event.user,
          exercise: event.exercise,
          Booking: event.Booking,
          psychologistBookings: event.psychologistBookings,
        }));

        setEvents(formatted);
      } catch (err) {
        setError(err);
      }
    };

    if (isPsychologist) {
      fetchUsers();
    }

    fetchEvents();
    fetchExercises();
  }, []);

  const handleUpdateEvent = async (updatedEvent: any) => {
    try {
      const payload = {
        ...updatedEvent,
        start: updatedEvent.start.toISOString(),
        end: updatedEvent.end.toISOString(),
      };

      const response = await apiClient.patch(
        `/events/${selectedEvent?.id}`,
        payload
      );
      const updated = response.data;

      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent?.id
            ? {
                ...event,
                ...updated,
                start: new Date(updated.start),
                end: new Date(updated.end),
              }
            : event
        )
      );

      setIsEditModalOpen(false);
      setIsEditLocationModalOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      setError(error);
    }
  };

  const eventStyleGetter = (event: Event) => {
    const backgroundColor = event.color || "#4285F4";
    const style = {
      backgroundColor,
      borderRadius: "6px",
      opacity: 0.9,
      color: "white",
      border: "0px",
      display: "block",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      padding: "2px 5px",
      fontSize: "0.85rem",
    };
    return {
      style,
    };
  };

  const handleSelectEvent = (event: Event) => {
    console.log(event);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title.trim())
        throw new Error(t("Please enter event title"));

      if (newEvent.start >= newEvent.end)
        throw new Error(t("End time must be after start time"));

      if (newEvent.start < new Date())
        throw new Error(t("Cannot create events in the past"));
      console.log(newEvent);

      const response = await apiClient.post("/events", {
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString(),
        userId:
          isPsychologist && newEvent.userId != 0 && newEvent.userId ? newEvent.userId : user?.id,
      });

      const createdEvent = response.data;

      if (isPsychologist && newEvent.userId != 0 && newEvent.userId) {
      } else {
        setEvents((prev) => [
          ...prev,
          {
            ...createdEvent,
            start: new Date(createdEvent.start),
            end: new Date(createdEvent.end),
          },
        ]);
      }

      setIsCreateEventModalOpen(false);
      setNewEvent({
        title: "",
        start: new Date(),
        end: new Date(),
      });
    } catch (error) {
      setError(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const closeCreateEventModal = () => {
    setIsCreateEventModalOpen(false);
    setNewEvent({
      title: "",
      start: new Date(),
      end: new Date(),
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "start" || name === "end") {
      const localDate = new Date(value);
      const utcDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000
      );

      setNewEvent((prev) => ({
        ...prev,
        [name]: utcDate,
      }));
    } else {
      setNewEvent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-4 h-full relative">
        <button
          onClick={() => setIsCreateEventModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors absolute top-4 right-4 z-10 shadow-md"
        >
          {t("Create Event")}
        </button>
        <Calendar
          localizer={localizer}
          events={events}
          culture={language === "uk" ? "uk-UA" : "en-US"}
          formats={formats}
          startAccessor="start"
          endAccessor="end"
          defaultView={view}
          view={view}
          date={date}
          messages={{
            today: t("Today"),
            previous: t("Back"),
            next: t("Next"),
            month: t("Month"),
            week: t("Week"),
            day: t("Day"),
            agenda: t("Agenda"),
            date: t("Date"),
            time: t("Time"),
            event: t("Event"),
            noEventsInRange: t("No events in this range"),
          }}
          onView={(view: View) => setView(view)}
          onNavigate={(date) => setDate(new Date(date))}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          style={{ height: "calc(100% - 10px)" }}
          eventPropGetter={eventStyleGetter}
          toolbar={true}
          components={{
            toolbar: CustomToolbar,
          }}
          onSelectEvent={handleSelectEvent}
          className="border border-gray-200 rounded-lg"
        />

        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div
                className="h-3 rounded-t-lg"
                style={{ backgroundColor: selectedEvent.color || "#4285F4" }}
              />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedEvent.title}
                  </h2>
                  <button
                    onClick={closeModal}
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

                {/* Time */}
                <InfoBlock
                  icon="clock"
                  label={t("Time")}
                  value={
                    selectedEvent.allDay
                      ? t("All day")
                      : `${format(selectedEvent.start, "d MMMM yyyy, HH:mm", {
                          locale,
                        })} - ${format(
                          selectedEvent.end,
                          "d MMMM yyyy, HH:mm",
                          {
                            locale,
                          }
                        )}`
                  }
                  extra={`(${
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  })`}
                />

                {/* Location */}
                {selectedEvent.location && (
                  <InfoBlock
                    icon="map-pin"
                    label={t("Location")}
                    value={selectedEvent.location}
                  />
                )}

                {/* Type */}
                <InfoBlock
                  icon="tag"
                  label={t("Event type")}
                  value={selectedEvent.type}
                />

                {/* Description */}
                {selectedEvent.description && (
                  <InfoBlock
                    icon="file-text"
                    label={t("Description")}
                    value={selectedEvent.description}
                  />
                )}

                {/* Created by */}
                {selectedEvent.createdBy?.displayName && (
                  <InfoBlock
                    icon="user"
                    label={t("Created by")}
                    value={selectedEvent.createdBy.displayName}
                  />
                )}

                {/* Exercise */}
                {selectedEvent.exercise && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {t("Exercise details")}
                    </p>
                    <div className="text-sm text-gray-800 space-y-1">
                      <p>
                        <strong>{t("Name")}:</strong>{" "}
                        {selectedEvent.exercise.name}
                      </p>
                      <p>
                        <strong>{t("Type")}:</strong>{" "}
                        {selectedEvent.exercise.type}
                      </p>
                      <p>
                        <strong>{t("Description")}:</strong>{" "}
                        {selectedEvent.exercise.description}
                      </p>
                      <p>
                        <a
                          href={`/exercises/${selectedEvent.exercise.id}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("Open exercise")}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Booking Info */}
                {selectedEvent && selectedEvent.Booking?.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {t("Booking details")}
                    </p>
                    <div className="text-sm text-gray-800 space-y-1">
                      <p>
                        <strong>{t("Status")}:</strong>{" "}
                        {selectedEvent.Booking[0].status}
                      </p>
                      <p>
                        <strong>{t("With")}:</strong>{" "}
                        {selectedEvent.Booking[0].user?.displayName ||
                          t("Psychologist")}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent &&
                  selectedEvent.psychologistBookings?.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {t("Booking details")}
                      </p>
                      <div className="text-sm text-gray-800 space-y-1">
                        <p>
                          <strong>{t("Status")}:</strong>{" "}
                          {selectedEvent.psychologistBookings[0].status}
                        </p>
                        <p>
                          <strong>{t("With")}:</strong>{" "}
                          {selectedEvent.psychologistBookings[0].user
                            ?.displayName || t("User")}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {t("Close")}
                  </button>
                  {/* Користувач може редагувати свої події без бронювання */}
                  {user?.id === selectedEvent.user.id &&
                    selectedEvent.type !== "MEETING" && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {t("Edit")}
                      </button>
                    )}

                  {/* Психолог може редагувати свої власні події */}
                  {/* {user?.role === "psychologist" &&
                    selectedEvent.type !== "MEETING" &&
                    user?.id === selectedEvent.user.id &&
                    user?.id === selectedEvent.createdBy.id && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {t("Edit")}
                      </button>
                    )} */}

                  {/* Психолог може оновлювати локацію для букінгів */}
                  {user?.role === "psychologist" &&
                    user?.id === selectedEvent.createdBy.id &&
                    selectedEvent.type === "MEETING" && (
                      <button
                        onClick={() => setIsEditLocationModalOpen(true)}
                        className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {t("Update Location")}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <EditEventModal
            event={selectedEvent}
            onSave={handleUpdateEvent}
            onClose={() => setIsEditModalOpen(false)}
            availableExercises={availableExercises}
            assignedUsers={assignedUsers}
          />
        )}

        {isEditLocationModalOpen && (
          <EditLocationModal
            location={selectedEvent.location || ""}
            onSave={(newLocation) =>
              handleUpdateEvent({ ...selectedEvent, location: newLocation })
            }
            onClose={() => setIsEditLocationModalOpen(false)}
          />
        )}

        {/* Create Event Modal */}
        {isCreateEventModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {t("Create Event")}
                  </h2>
                  <button
                    onClick={closeCreateEventModal}
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Title")} *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newEvent.title}
                      onChange={handleFormChange}
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
                      value={newEvent.type || "CUSTOM"}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          type: e.target.value as Event["type"],
                          exerciseId: undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CUSTOM">{t("Своя подія")}</option>
                      <option value="EXERCISE">{t("Вправа")}</option>
                      {/* <option value="MEDITATION">{t("Медитація")}</option> */}
                    </select>
                  </div>

                  {newEvent.type === "EXERCISE" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Оберіть вправу")}
                      </label>
                      <select
                        value={newEvent.exerciseId || ""}
                        onChange={(e) =>
                          setNewEvent((prev) => ({
                            ...prev,
                            exerciseId: Number(e.target.value),
                          }))
                        }
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

                  {isPsychologist && assignedUsers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Призначити користувачу")}
                      </label>
                      <select
                        value={newEvent.userId || ""}
                        onChange={(e) =>
                          setNewEvent((prev) => ({
                            ...prev,
                            userId: Number(e.target.value),
                          }))
                        }
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
                        selected={newEvent.start}
                        onChange={(date: Date) =>
                          setNewEvent((prev) => ({ ...prev, start: date }))
                        }
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
                        selected={newEvent.end}
                        onChange={(date: Date) =>
                          setNewEvent((prev) => ({ ...prev, end: date }))
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="d MMMM yyyy, HH:mm"
                        locale={language === "uk" ? uk : enUS}
                        minDate={newEvent.start}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeCreateEventModal}
                    className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {t("Create Event")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Toolbar Component
function CustomToolbar({
  label,
  onNavigate,
  onView,
}: ToolbarProps<Event, object>) {
  const { t } = useLanguage();
  return (
    <div className="rbc-toolbar flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          {t("Today")}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate("PREV")}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
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
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
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
        </div>
        <span className="ml-2 text-lg font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onView(Views.DAY)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          {t("Day")}
        </button>
        <button
          type="button"
          onClick={() => onView(Views.WEEK)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          {t("Week")}
        </button>
        <button
          type="button"
          onClick={() => onView(Views.MONTH)}
          className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          {t("Month")}
        </button>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  extra,
}: {
  icon: "clock" | "map-pin" | "tag" | "file-text" | "user";
  label: string;
  value: string | JSX.Element;
  extra?: string;
}) {
  const icons = {
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    "map-pin": (
      <>
        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    tag: <path d="M20 12H4" />,
    "file-text": (
      <path d="M9 12h6m-6 4h6M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
    ),
    user: (
      <path d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87M12 3a4 4 0 110 8 4 4 0 010-8z" />
    ),
  };

  return (
    <div className="flex items-start space-x-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mt-0.5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {icons[icon]}
      </svg>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm text-gray-800">
          {value}
          {extra && (
            <span className="block text-xs text-gray-500 mt-1">{extra}</span>
          )}
        </p>
      </div>
    </div>
  );
}
