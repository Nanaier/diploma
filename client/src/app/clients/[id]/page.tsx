/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { RouteGuard } from "@/components/RouteGuard";
import { useAuth, User } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

import CalendarComponent from "@/components/Calendar/CalendarComponent";
import apiClient from "@/lib/apiClient";
import { Event } from "@/components/Calendar/types";
import { Button } from "@headlessui/react";
import { useError } from "@/contexts/ErrorContext";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import MoodStats from "@/components/MoodTracker/MoodStats";
import MoodHistory from "@/components/MoodTracker/MoodHistory";
import TipOfTheDay from "@/components/Dashboard/TipOfTheDay";
import KPICards from "@/components/Dashboard/KPICards";
import UpcomingEvents from "@/components/Dashboard/UpcomingEvents";

export default function ClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const { setError } = useError();
  const { initialized, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [moodRecords, setMoodRecords] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [clientData, setClientData] = useState<User | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [availableExercises, setAvailableExercises] = useState<any>([]);

  useEffect(() => {
    if (!initialized || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        setIsClientLoading(true);

        const clientRes = await apiClient.get(`/user/${id}`);
        console.log(clientRes);
        setClientData(clientRes.data);

        const [eventsRes, moodRes, exercisesRes, usersRes] = await Promise.all([
          apiClient.get("/events", { params: { userId: id } }),
          apiClient.get("/mood", { params: { userId: id } }),
          apiClient.get("/exercises"),
          user?.role === "psychologist"
            ? apiClient.get("/psychologist/users")
            : Promise.resolve({ data: [] }),
        ]);

        const formattedEvents = eventsRes.data.map(formatEvent);

        setEvents(formattedEvents);
        setAvailableExercises(exercisesRes.data);
        setMoodRecords(moodRes.data);
        if (user?.role === "psychologist") {
          setAssignedUsers(usersRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
        router.push("/dashboard");
      } finally {
        setIsClientLoading(false);
      }
    };

    fetchData();
  }, [initialized, user, id]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }
  }, [router]);

  function formatEvent(event: any): Event {
    return {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay ?? false,
    };
  }

  const handleUpdateEvent = async (updatedEvent: any) => {
    try {
      const response = await apiClient.patch(`/events/${updatedEvent.id}`, {
        ...updatedEvent,
        start: updatedEvent.start.toISOString(),
        end: updatedEvent.end.toISOString(),
      });
      // Update local state to reflect changes
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
        )
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update event:", error);
      setError(error);
      throw error;
    }
  };

  const handleCreateEvent = async (newEvent: Event) => {
    try {
      const response = await apiClient.post("/events", {
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString(),
      });
      // Add new event to local state
      setEvents((prev) => [...prev, formatEvent(response.data)]);
      return response.data;
    } catch (error) {
      console.error("Failed to create event:", error);
      setError(error);
      throw error;
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (!initialized || !user || isClientLoading) return <LoadingSpinner />;
  if (events.length === 0) return <LoadingSpinner />;

  if (!clientData) {
    return (
      <RouteGuard auth redirect="/">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Клієнт</h1>
            <Button onClick={handleBackToDashboard}>Назад до клієнтів</Button>
          </div>
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Клієнта не знайдено</p>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard auth redirect="/">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <button
            onClick={handleBackToDashboard}
            className={cn(
              "flex items-center text-gray-700 hover:text-blue-600 transition-colors",
              "px-3 py-2 rounded-lg hover:bg-gray-100"
            )}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад до панелі
          </button>
        </div>

        {/* Client Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl md:text-4xl font-bold text-gray-400">
                  {clientData.displayName?.charAt(0) ||
                    clientData.email?.charAt(0)}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {clientData.displayName || clientData.email}
              </h1>
              <p className="text-gray-600 mb-2">{clientData.email}</p>
              <p className="text-gray-500 text-sm">
                Приєднався:{" "}
                {new Date(clientData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICards
            stats={{
              moodEntries: moodRecords.length,
              meetings: events.filter((e) => new Date(e.start) > new Date())
                .length,
            }}
          />
          <TipOfTheDay />
          <UpcomingEvents
            events={events.filter((e) => new Date(e.start) > new Date()) as any}
            isHideAllEventsButton={true}
          />
        </div>

        {/* Mood Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodStats entries={moodRecords} />
          <MoodHistory entries={moodRecords} isLoading={isClientLoading} />
        </div>
        
        {/* Calendar Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Календар подій</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">Немає запланованих подій.</p>
          ) : (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <CalendarComponent
                user={user}
                events={events}
                assignedUsers={assignedUsers}
                availableExercises={availableExercises}
                onUpdateEvent={handleUpdateEvent}
                onCreateEvent={handleCreateEvent}
                isCreateButton={false}
              />
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
