"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiClock } from "react-icons/fi";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  interval?: number;
  minTime?: string;
}

export const TimePicker = ({
  value,
  onChange,
  interval = 30,
  minTime,
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  useEffect(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Filter out times that are before minTime if provided
        if (!minTime || time >= minTime) {
          options.push(time);
        }
      }
    }
    setTimeOptions(options);
  }, [interval, minTime]);

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
      >
        <span className="flex items-center">
          <FiClock className="mr-2 text-gray-400" />
          {value}
        </span>
        <FiChevronDown className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {timeOptions.map((time) => (
            <div
              key={time}
              onClick={() => handleSelect(time)}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                value === time ? "bg-blue-100 text-blue-800" : "text-gray-900"
              }`}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
