// components/auth/PsychologistRouteGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { UserStatus } from "@/types/auth";

interface PsychologistRouteGuardProps {
  children: React.ReactNode;
  /**
   * Required status for access
   */
  requiredStatus: UserStatus;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
}

export function PsychologistRouteGuard({
  children,
  requiredStatus,
  loadingComponent = <LoadingSpinner />,
}: PsychologistRouteGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Immediate redirect for non-psychologists
    if (user?.role !== "psychologist") {
      router.push("/dashboard");
      return;
    }

    // Status-specific redirection
    if (user.status !== requiredStatus) {
      const redirectPath = getPsychologistRedirectPath(user.status);
      router.push(redirectPath);
    }
  }, [user, loading]);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Final authorization check
  const isAuthorized =
    user?.role === "psychologist" && user.status === requiredStatus;

  if (!isAuthorized) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}

// Helper function for psychologist redirect logic
function getPsychologistRedirectPath(status: UserStatus): string {
  switch (status) {
    case "needs_profile":
      return "/psychologist/complete-profile";
    case "pending":
      return "/psychologist/pending";
    case "approved":
      return "/dashboard";
    case "rejected":
      return "/psychologist/rejected";
    default:
      return "/dashboard";
  }
}

// Pre-configured guards for specific psychologist routes
export function CompleteProfileGuard({
  children,
  loadingComponent,
}: {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  return (
    <PsychologistRouteGuard
      requiredStatus="needs_profile"
      loadingComponent={loadingComponent}
    >
      {children}
    </PsychologistRouteGuard>
  );
}

export function ApprovedPsychologistGuard({
  children,
  loadingComponent,
}: {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  return (
    <PsychologistRouteGuard
      requiredStatus="approved"
      loadingComponent={loadingComponent}
    >
      {children}
    </PsychologistRouteGuard>
  );
}

export function PendingApprovalGuard({
  children,
  loadingComponent,
}: {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  return (
    <PsychologistRouteGuard
      requiredStatus="pending"
      loadingComponent={loadingComponent}
    >
      {children}
    </PsychologistRouteGuard>
  );
}
