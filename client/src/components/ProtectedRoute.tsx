// components/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  allowedStatuses = [],
  redirectPath = "/",
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedStatuses?: string[];
  redirectPath?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check role and status access
    const hasRoleAccess =
      allowedRoles.length === 0 ||
      (user.role && allowedRoles.includes(user.role));
    const hasStatusAccess =
      allowedStatuses.length === 0 ||
      (user.status && allowedStatuses.includes(user.status));

    if (!hasRoleAccess || !hasStatusAccess) {
      // Special handling for psychologists needing profile completion
      if (user.role === "psychologist" && user.status === "needs_profile") {
        router.push("/psychologist/complete-profile");
      } else {
        router.push(redirectPath);
      }
    }
  }, [user, loading, router, allowedRoles, allowedStatuses, redirectPath]);

  if (loading || !user) {
    return <div className="p-6">Loading...</div>;
  }

  return <>{children}</>;
}
