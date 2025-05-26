// hooks/useDashboardData.ts
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useNotifications } from "./NotificationContext";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [moodEntries, setMoodEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { notifications } = useNotifications();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [moodRes, eventsRes, psychologistRes] = await Promise.all([
          apiClient.get("/mood"),
          apiClient.get("/events/upcoming"),
          apiClient.get("/auth/me"),
        ]);

        setMoodEntries(moodRes.data);
        setEvents(eventsRes.data);

        setPsychologists(psychologistRes.data.assignedPsychologists);
        setClients(psychologistRes.data.assignedUsers);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setError("Не вдалося завантажити дані");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const unreadNotifications = notifications.filter((x) => !x.isRead);

  return {
    loading,
    error,
    moodEntries,
    events,
    notifications: unreadNotifications,
    psychologists,
    clients,
  };
}
