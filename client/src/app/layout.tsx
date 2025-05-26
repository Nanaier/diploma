"use client";

import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="bg-white text-gray-900 min-h-screen">
        <Providers>
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link
                  href="/"
                  className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  MindHarbor
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          {/* Layout with Sidebar */}
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
