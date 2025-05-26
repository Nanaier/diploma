import React from "react";
import { Exercise } from "@/app/exercises/page";
import { cn } from "@/lib/utils";

type Props = {
  exercise: Exercise;
  onClick: () => void;
  className?: string;
};

const ExerciseCard: React.FC<Props> = ({ exercise, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer p-4 transition-all duration-200",
        "flex flex-col gap-2",
        className
      )}
    >
      <h3 className="font-medium text-gray-800">{exercise.name}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">
        {exercise.description}
      </p>
      <span className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full self-start">
        {exercise.type}
      </span>
    </div>
  );
};

export default ExerciseCard;
