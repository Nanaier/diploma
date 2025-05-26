"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/RouteGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Psychologist {
  id: number;
  user: {
    id: number;
    displayName: string;
    email: string;
    createdAt: string;
  };
  description: string;
  certUrl: string;
  specialty: string;
  avatarUrl?: string;
  yearsOfExperience?: number;
}

interface PsychologistsResponse {
  data: Psychologist[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PsychologistsListPage() {
  const { initialized } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialized) {
      fetchPsychologists(page);
    }
  }, [page, initialized]);

  const fetchPsychologists = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get<PsychologistsResponse>(
        "/psychologist/approved",
        {
          params: { page: currentPage, limit: 5 },
        }
      );

      setPsychologists(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error("Не вдалося завантажити психологів", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <RouteGuard auth redirect="/auth/login">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Психологи</h1>
            <p className="mt-2 text-gray-600">
              Знайдіть кваліфікованого спеціаліста для ваших потреб
            </p>
          </div>

          <div className="space-y-6">
            {psychologists.length === 0 && !loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  Наразі немає доступних психологів
                </p>
              </div>
            ) : (
              psychologists.map((psych) => (
                <Link
                  href={`/psychologists/${psych.id}`}
                  key={psych.id}
                  className="block group transition-all hover:scale-[1.01]"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0">
                        {psych.avatarUrl ? (
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <Image
                              src={psych.avatarUrl}
                              alt={`${psych.user.displayName}'s avatar`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 96px, 96px"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600">
                            {psych.user.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                            {psych.user.displayName}
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {psych.specialty}
                            </span>
                            {psych.yearsOfExperience && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {psych.yearsOfExperience}+ років досвіду
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-3 text-gray-600 line-clamp-2">
                          {psych.description}
                        </p>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-2 w-4 h-4 text-gray-400" />
                          Приєднався:{" "}
                          {new Date(psych.user.createdAt).toLocaleDateString(
                            "uk-UA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="mr-2 h-5 w-5" />
                Попередня
              </button>
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
                  return pageNum > 0 && pageNum <= totalPages ? (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        page === pageNum
                          ? "bg-blue-600 text-white font-medium"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ) : null;
                })}
                {totalPages > 5 && page < totalPages - 2 && (
                  <span className="flex items-end px-2 text-gray-500">...</span>
                )}
                {totalPages > 5 && page < totalPages - 2 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center ${
                      page === totalPages
                        ? "bg-blue-600 text-white font-medium"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Наступна
                <FiChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
