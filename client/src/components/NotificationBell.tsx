import { useEffect, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useError } from "@/contexts/ErrorContext";

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleBookingResponse,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { setError } = useError();

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    }
  }, [user]);

  const handleResponse = async (
    notificationId: number,
    response: "ACCEPTED" | "DENIED"
  ) => {
    try {
      await handleBookingResponse(notificationId, response);
      markAsRead(notificationId);
    } catch (error) {
      setError(error); // Add error handling
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MEETING_INVITE":
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case "MEETING_REMINDER":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200"></div>;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative transition-colors duration-200"
        aria-label="Сповіщення"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[18px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-100 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-medium text-gray-800 text-sm uppercase tracking-wider">
              Сповіщення
            </h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Позначити всі як прочитані
                </button>
              )}
              <span className="text-xs text-gray-500">
                {notifications.length} всього
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Поки немає сповіщень</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ми повідомимо вас, коли щось з'явиться
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isPendingInvite =
                  notification.type === "MEETING_INVITE" &&
                  notification.response == "PENDING";
                const isAccepted = notification.response === "ACCEPTED";
                const isDeclined = notification.response === "DENIED";

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    } ${
                      isAccepted
                        ? "border-l-4 border-l-green-500"
                        : isDeclined
                        ? "border-l-4 border-l-red-500"
                        : ""
                    }`}
                    onClick={() =>
                      !notification.isRead && markAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              isAccepted
                                ? "text-green-700"
                                : isDeclined
                                ? "text-red-700"
                                : "text-gray-800"
                            }`}
                          >
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {isPendingInvite && (
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResponse(notification.id, "ACCEPTED");
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckIcon className="-ml-0.5 mr-1 h-3 w-3" />
                              Прийняти
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResponse(notification.id, "DENIED");
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XMarkIcon className="-ml-0.5 mr-1 h-3 w-3" />
                              Відхилити
                            </button>
                          </div>
                        )}

                        {isAccepted && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckIcon className="mr-1 h-3 w-3" />
                            Прийнято
                          </div>
                        )}

                        {isDeclined && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XMarkIcon className="mr-1 h-3 w-3" />
                            Відхилено
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
