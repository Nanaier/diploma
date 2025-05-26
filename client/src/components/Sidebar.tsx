"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LogOut,
  User,
  Calendar,
  LayoutDashboard,
  Users,
  ChevronLeft,
  Menu,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define menu items for different roles
const getMenuItems = (role: string) => {
  const commonItems = [
    { href: "/dashboard", label: "Панель керування", icon: LayoutDashboard },
    { href: "/me", label: "Профіль", icon: User },
    { href: "/events", label: "Мої події", icon: Calendar },
  ];

  const adminItems = [
    {
      href: "/admin/psychologists",
      label: "Психологи на розгляді",
      icon: Users,
    },
  ];

  const psychologistItems = [
    {
      href: "/psychologist/availability",
      label: "Доступність",
      icon: Calendar,
    },
  ];

  const userItems = [
    { href: "/psychologists", label: "Знайти психологів", icon: Users },
    { href: "/exercises", label: "Вправи", icon: MessageSquare },
  ];

  switch (role) {
    case "admin":
      return [...commonItems, ...adminItems];
    case "psychologist":
      return [...commonItems, ...psychologistItems];
    case "user":
      return [...commonItems, ...userItems];
    default:
      return commonItems;
  }
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user || user.status !== "approved") return null;

  // Get menu items based on user role
  const menuItems = getMenuItems(user.role);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-y-auto scrollbar-hide",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex justify-between items-center p-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-blue-600">
            {user.role === "psychologist" ? "Меню терапевта" : "Меню"}
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "hover:bg-gray-200 text-gray-700"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 mt-4"
        >
          <LogOut size={18} />
          {!collapsed && <span>Вийти</span>}
        </button>
      </nav>
    </aside>
  );
}
