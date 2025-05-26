// contexts/NotificationContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWebSocket } from "./WebSocketContext";
import apiClient from "../lib/apiClient";
import { useAuth } from "./AuthContext";
import { useError } from "./ErrorContext";

type Notification = {
  id: number;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
  eventId?: number;
  response?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleBookingResponse: (
    id: number,
    response: "ACCEPTED" | "DENIED"
  ) => Promise<void>;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  handleBookingResponse: async () => {},
  clearNotifications: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const notificationSound = "/sounds/chime-sound-7143.mp3";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, joinRoom, leaveRoom } = useWebSocket();
  const { user } = useAuth();
  const { setError } = useError();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get("/notifications");
        setNotifications(res.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    console.log("notif start");
    console.log(user);
    console.log(socket);
    if (!socket || !user) return;

    // ✅ Join the room before listening
    // console.log(`Joining room: user_${user.id}`);
    // socket.emit("join", `user_${user.id}`);

    const room = `user_${user.id}`;
    console.log(`Joining room: ${room}`);
    joinRoom(room);

    const handleNotification = (notification: Notification) => {
      console.log("Received new notification:", notification);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("newNotification", handleNotification);

    return () => {
      // socket.off("newNotification");
      console.log(`Cleaning up notification listener for ${room}`);
      socket.off("newNotification", handleNotification);
      leaveRoom(room);
    };
  }, [socket, user, joinRoom, leaveRoom]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!user) {
      clearNotifications();
    }
  }, [user, clearNotifications]);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (socket && user) {
        const room = `user_${user.id}`;
        leaveRoom(room);
      }
    };
  }, [socket, user, leaveRoom]);

  const handleBookingResponse = async (
    notificationId: number,
    response: "ACCEPTED" | "DENIED"
  ) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/response`, {
        response,
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, response: response } : n
        )
      );
    } catch (error) {
      setError(error);
      console.error("Error handling booking response:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        handleBookingResponse,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
