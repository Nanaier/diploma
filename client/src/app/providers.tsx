"use client";

import ErrorToast from "@/components/ErrorToast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <WebSocketProvider>
          <LanguageProvider>
            <ErrorProvider>
              <NotificationProvider>
                {children}
                <ErrorToast />
              </NotificationProvider>
            </ErrorProvider>
          </LanguageProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
