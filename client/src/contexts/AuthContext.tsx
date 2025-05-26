"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { UserStatus } from "@/types/auth";
import { useNotifications } from "./NotificationContext";
import { useWebSocket } from "./WebSocketContext";

type Role = "user" | "psychologist" | "admin";

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  description: string;
  assignedUsers?: {
    id: string;
    displayName: string;
    email: string;
    status: string;
  }[];
  assignedPsychologists?: {
    id: number;
    approved: boolean;
    dataStatus: "approved" | "pending";
    user: {
      id: string;
      displayName: string;
      email: string;
      status: string;
    };
  }[];
  Psychologist?: {
    id: number;
    userId: number;
    description: string;
    certUrl: string;
    approved: boolean;
    phoneNumber: string;
    avatarUrl: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { notifications, clearNotifications } = useNotifications();
  const { leaveRoom } = useWebSocket();

  const router = useRouter();

  const fetchUser = async (token: string) => {
    try {
      const [meResponse, verifyResponse] = await Promise.all([
        apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          params: { fresh: true },
        }),
        apiClient.post(
          "/auth/verify-token",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      const userData = meResponse.data;
      console.log(userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Auth error:", err);
      logout();
      throw err;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          setToken(storedToken);
          await fetchUser(storedToken);
        } catch {
          // Error already handled in fetchUser
        }
      }
      setInitialized(true);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token: string) => {
    setLoading(true);
    try {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;
      setToken(token);

      const userData = await fetchUser(token);

      // Immediate redirect based on role/status
      if (userData.role === "psychologist") {
        if (userData.status === "needs_profile") {
          router.replace("/psychologist/complete-profile");
          return;
        }
        if (userData.status === "pending") {
          router.replace("/psychologist/pending");
          return;
        }
      }
      router.replace("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    if (user) {
      leaveRoom(`user_${user.id}`);
    }
    // Clear token and user first
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    setToken(null);
    setUser(null);

    // Then clear notifications
    clearNotifications();

    // Finally redirect
    router.replace("/auth/login");
  }, [clearNotifications, router, user, leaveRoom]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      await fetchUser(token);
    } catch (err) {
      console.error("Failed to refresh user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initialized,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
