"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { Exercise } from "../page";
import BreathingExerciseComponent from "@/components/BreathingExerciseComponent/BreathingExerciseComponent";
import ExerciseComponent from "@/components/ExerciseComponent/ExerciseComponent";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteGuard } from "@/components/RouteGuard";
import MeditationComponent from "@/components/MeditationComponent/MeditationComponent";

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await apiClient.get(`/exercises/${id}`);
        setExercise(res.data);
      } catch (err) {
        console.error("Failed to load exercise", err);
      }
    };
    fetchExercise();
  }, [id]);

  const handleBackClick = () => {
    router.push("/exercises");
  };

  if (!exercise)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-600">Loading exercise...</div>
      </div>
    );

  return (
    <RouteGuard auth redirect="/auth/login">
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackClick}
            className={cn(
              "mb-6 flex items-center text-gray-700 hover:text-blue-600 transition-colors",
              "px-3 py-2 rounded-lg hover:bg-gray-200"
            )}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад до вправ
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {exercise.type === "BREATHING" && (
              <div className="p-6">
                <BreathingExerciseComponent exercise={exercise} />
              </div>
            )}

            {(exercise.type === "GROUNDING" ||
              exercise.type === "PHYSICAL") && (
              <div className="p-6">
                <ExerciseComponent exercise={exercise} />
              </div>
            )}

            {exercise.type === "MEDITATION" && (
              <div className="p-6">
                <MeditationComponent />
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
