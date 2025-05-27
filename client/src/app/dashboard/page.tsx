"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MoodTracker from "@/components/MoodTracker/MoodTracker";
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpcomingEvents from "@/components/Dashboard/UpcomingEvents";
import RecommendedExercises from "@/components/Dashboard/RecommendedExercises";
import PsychologistCard from "@/components/Dashboard/PsychologistCard";
import TipOfTheDay from "@/components/Dashboard/TipOfTheDay";
import NotificationsWidget from "@/components/Dashboard/NotificationsWidget";
import KPICards from "@/components/Dashboard/KPICards";
import { useDashboardData } from "@/contexts/useDashboardData";
import ClientCard from "@/components/Dashboard/ClientCard";
import apiClient from "@/lib/apiClient";
import RecommendedPsychologists from "@/components/Dashboard/RecommendedPsychs";

export default function DashboardPage() {
  const router = useRouter();
  const { initialized, user } = useAuth();

  const {
    loading,
    moodEntries,
    events,
    notifications,
    psychologists,
    clients,
  } = useDashboardData();
  const [isDataReady, setIsDataReady] = useState(false);
  const [matchingPsychologists, setMatchingPsychs] = useState([]);
  const [matchingExercises, setMatchingExercises] = useState([]);

  console.log(notifications);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const matchingPsychs = await apiClient.get("/matching/psychologists");
      const matchingExercises = await apiClient.get("/matching/exercises");
      console.log(matchingPsychs);
      console.log(matchingExercises);
      setMatchingPsychs(matchingPsychs.data);
      setMatchingExercises(matchingExercises.data);
    };

    // Check if all critical data is loaded
    if (initialized && !loading && user) {
      if (user.role === "user") fetchData();
      setIsDataReady(true);
    }
  }, [initialized, loading, user]);

  if (!initialized || !isDataReady) return <LoadingSpinner />;

  return (
    <RouteGuard
      auth
      roles={["user", "psychologist", "admin"]}
      statuses={["approved"]}
      redirect="/psychologist/complete-profile"
    >
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Моя панель</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {user?.role === "user" ? (
            <div className="md:col-span-2 lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold">Мої психологи</h2>
              {psychologists.length > 0 ? (
                psychologists.map((psych: any) => (
                  <PsychologistCard key={psych.id} psychologist={psych} />
                ))
              ) : (
                <PsychologistCard psychologist={null} />
              )}
            </div>
          ) : (
            <div className="md:col-span-2 lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold">Мої клієнти</h2>
              {clients.length > 0 ? (
                clients.map((client: any) => (
                  <ClientCard key={client.id} client={client} />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-gray-500">Клієнтів ще не призначено</p>
                </div>
              )}
            </div>
          )}

          <KPICards
            stats={{
              moodEntries: moodEntries.length,
              meetings: events.length,
            }}
          />

          <TipOfTheDay />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <MoodTracker />
          </div>

          <div className="space-y-6">
            <UpcomingEvents events={events} />
            <NotificationsWidget notifications={notifications} />
          </div>
        </div>
        {user?.role === "user" && (
          <div className="space-y-6">
            <RecommendedExercises exercises={matchingExercises} />
            <RecommendedPsychologists psychs={matchingPsychologists} />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
