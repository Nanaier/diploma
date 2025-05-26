/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RouteGuard } from "@/components/RouteGuard";
import { useAuth, User } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

import CalendarComponent from "@/components/Calendar/CalendarComponent";
import apiClient from "@/lib/apiClient";
import { Event } from "@/components/Calendar/types";
import { useError } from "@/contexts/ErrorContext";

export default function DashboardPage() {
  const router = useRouter();
  const { initialized, user } = useAuth();
  const { setError } = useError();
  const [events, setEvents] = useState<Event[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // Add this

  useEffect(() => {
    if (!initialized || !user) {
      return;
    }

    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch all data in parallel
        const [eventsRes, exercisesRes, usersRes] = await Promise.all([
          apiClient.get("/events"),
          apiClient.get("/exercises"),
          user?.role === "psychologist"
            ? apiClient.get("/psychologist/users")
            : Promise.resolve({ data: [] }),
        ]);

        // console.log("Events Response:", eventsRes.data);
        // console.log("Exercises Response:", exercisesRes.data);
        // console.log("Users Response:", usersRes.data);

        const formattedEvents = eventsRes.data.map(formatEvent);
        // console.log(formattedEvents);

        setEvents(formattedEvents);
        setAvailableExercises(exercisesRes.data);
        if (user?.role === "psychologist") {
          setAssignedUsers(usersRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
      } finally {
        setIsDataLoading(false);
        setHasInitialLoad(true);
      }
    };

    fetchData();
  }, [initialized, user]);

  useEffect(() => {
    console.log(user);
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
      console.log(updatedEvent);
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
      // setEvents((prev) => [...prev, formatEvent(response.data)]);
      return response.data;
    } catch (error) {
      console.error("Failed to create event:", error);
      setError(error);
      throw error;
    }
  };

  if (!initialized || !user) return <LoadingSpinner />;
  if (isDataLoading && !hasInitialLoad) return <LoadingSpinner />;
  // if (events.length === 0) return <LoadingSpinner />;

  return (
    <RouteGuard auth redirect="/">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Події</h1>

        <CalendarComponent
          user={user}
          events={events}
          assignedUsers={assignedUsers}
          availableExercises={availableExercises}
          onUpdateEvent={handleUpdateEvent}
          onCreateEvent={handleCreateEvent}
          isLoading={isDataLoading}
        />
      </div>
    </RouteGuard>
  );
}
