"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
}

export default function LoadingSpinner({
  className,
  size = "md",
  color = "primary",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    primary: "border-blue-500 border-r-transparent",
    secondary: "border-gray-500 border-r-transparent",
    white: "border-white border-r-transparent",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "inline-block animate-spin rounded-full",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
