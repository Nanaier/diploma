"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import Image from "next/image";

type Psychologist = {
  id: number;
  description: string;
  certUrl: string;
  specialty: string;
  phoneNumber: string;
  avatarUrl?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export default function AdminPsychologistsPage() {
  const { initialized } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<number, boolean>
  >({});

  const fetchPending = async () => {
    const data = await apiClient.get(`/admin/psychologists/pending`);
    console.log(data.data);
    setPsychologists(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id: number) => {
    await apiClient.post(`/admin/psychologists/${id}/approve`, {});
    fetchPending();
  };

  const reject = async (id: number) => {
    await apiClient.post(`/admin/psychologists/${id}/reject`, {});
    fetchPending();
  };

  const toggleDescription = (id: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const shouldTruncate = (text: string) => {
    return text.split(/\s+/).length > 50;
  };

  const truncateText = (text: string) => {
    const words = text.split(/\s+/);
    return words.slice(0, 50).join(" ") + "...";
  };

  if (!initialized && loading) return <LoadingSpinner />;

  return (
    <RouteGuard
      auth
      roles={["admin"]}
      statuses={["approved"]}
      redirect="/dashboard"
    >
      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Психологи на розгляді
          </h1>
          <p className="text-gray-600 mt-2">
            Перевірте та затвердіть нові реєстрації психологів
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : psychologists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Немає заявок на розгляд
            </h3>
            <p className="mt-1 text-gray-500">
              Всі заявки психологів вже оброблені.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {psychologists.map((psych) => {
              const isExpanded = expandedDescriptions[psych.id] || false;
              const needsTruncation = shouldTruncate(psych.description);
              const displayText =
                needsTruncation && !isExpanded
                  ? truncateText(psych.description)
                  : psych.description;

              return (
                <div
                  key={psych.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-5">
                      {/* Аватар */}
                      <div className="flex-shrink-0">
                        {psych.avatarUrl ? (
                          <Image
                            src={psych.avatarUrl}
                            alt={`Аватар ${psych.user.name}`}
                            width={96}
                            height={96}
                            className="rounded-full object-cover h-24 w-24 border-2 border-gray-100"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Деталі */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-xl font-semibold text-gray-800 truncate">
                            {psych.user.name}
                          </h2>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {psych.specialty}
                          </span>
                        </div>

                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="truncate">{psych.user.email}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>{psych.phoneNumber}</span>
                          </div>
                        </div>

                        {/* Опис */}
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700">
                            Професійний опис
                          </h3>
                          <div className="mt-1 text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
                            {displayText}
                            {needsTruncation && (
                              <button
                                onClick={() => toggleDescription(psych.id)}
                                className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
                              >
                                {isExpanded ? "Згорнути" : "Розгорнути"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Сертифікація */}
                        {psych.certUrl && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700">
                              Сертифікація
                            </h3>
                            <div className="mt-1">
                              <a
                                href={psych.certUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mr-1.5 h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Переглянути сертифікат
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Дії */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      onClick={() => reject(psych.id)}
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="-ml-1 mr-2 h-5 w-5 text-red-500"
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
                      Відхилити
                    </button>
                    <button
                      onClick={() => approve(psych.id)}
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="-ml-1 mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Затвердити
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </RouteGuard>
  );
}
