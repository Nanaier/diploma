"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import ExerciseCard from "@/components/ExerciseCard";
import { cn } from "@/lib/utils";
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export type Exercise = {
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: any[];
};

export default function ExerciseListPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const router = useRouter();
  const [filters, setFilters] = useState({ types: "", tags: "", search: "" });
  const { initialized } = useAuth();

  const fetchExercises = async () => {
    try {
      const res = await apiClient.get("/exercises", {
        params: {
          types: filters.types,
          tags: filters.tags,
          search: filters.search,
        },
      });
      setExercises(res.data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filters]);

  const exerciseTypes = [
    { value: "BREATHING", label: "Дихательні" },
    { value: "PHYSICAL", label: "Фізичні" },
    { value: "MEDITATION", label: "Медитації" },
    { value: "GROUNDING", label: "На заземлення" },
  ];

  if (!initialized) return <LoadingSpinner />;
  return (
    <RouteGuard auth redirect="/auth/login">
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Вправи</h1>

          <div className="flex gap-2 mb-6 flex-wrap">
            {exerciseTypes.map((type) => (
              <button
                key={type.value}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm transition-colors",
                  filters.types === type.value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                )}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    types: prev.types === type.value ? "" : type.value,
                  }))
                }
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => router.push(`/exercises/${exercise.id}`)}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
