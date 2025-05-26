// components/auth/RouteGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserRole, UserStatus, UserWithPsychologist } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  /**
   * Whether authentication is required
   * @default true
   */
  auth?: boolean;
  /**
   * Allowed user roles
   * @default [] (all roles allowed)
   */
  roles?: UserRole[];
  /**
   * Allowed user statuses
   * @default [] (all statuses allowed)
   */
  statuses?: UserStatus[];
  /**
   * Redirect path when unauthorized
   * @default "/"
   */
  redirect?: string;
  /**
   * Custom authorization check
   */
  customCheck?: (user: UserWithPsychologist | null) => boolean;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;
}

export function RouteGuard({
  children,
  auth = true,
  roles = [],
  statuses = [],
  redirect = "/",
  customCheck,
  loadingComponent = <LoadingSpinner />,
  showLoading = true,
}: RouteGuardProps) {
  const router = useRouter();
  // In a real implementation, you would use your auth context here
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Authentication check
    if (auth && !user) {
      router.push("/auth/login");
      return;
    }

    // Authorization checks
    if (user) {
      // Role check
      if (roles.length > 0 && !roles.includes(user.role)) {
        router.push(redirect);
        return;
      }

      // Status check
      if (statuses.length > 0 && !statuses.includes(user.status)) {
        handleSpecialFlows();
        return;
      }

      // Custom check
      if (customCheck && !customCheck(user as any)) {
        router.push(redirect);
        return;
      }
    }
  }, [user, loading, initialized]);

  const handleSpecialFlows = () => {
    if (!user) return;

    if (user.role === "psychologist") {
      if (user.status === "needs_profile") {
        router.push("/psychologist/complete-profile");
      } else if (user.status === "pending") {
        router.push("/psychologist/pending");
      } else {
        router.push(redirect);
      }
    } else {
      router.push(redirect);
    }
  };

  if (!initialized) {
    return <>{loadingComponent}</>;
  }

  if (showLoading && loading) {
    return <>{loadingComponent}</>;
  }

  if (loading || (auth && !user)) {
    return <>{loadingComponent}</>; // still loading or not authenticated
  }

  // If user is authenticated but does not meet role/status criteria, block rendering
  if (user) {
    if (
      (roles.length > 0 && !roles.includes(user.role)) ||
      (statuses.length > 0 && !statuses.includes(user.status)) ||
      (customCheck && !customCheck(user as any))
    ) {
      return <>{loadingComponent}</>; // don't render children while redirecting
    }
  }

  return <>{children}</>;
}

// Specialized psychologist guards
interface PsychologistGuardProps
  extends Omit<RouteGuardProps, "roles" | "statuses"> {
  requireApproved?: boolean;
}

export function PsychologistGuard({
  requireApproved = false,
  ...props
}: PsychologistGuardProps) {
  return (
    <RouteGuard
      {...props}
      roles={["psychologist"]}
      statuses={
        requireApproved
          ? ["approved"]
          : ["pending", "approved", "needs_profile"]
      }
    />
  );
}

export function NeedsProfileGuard(
  props: Omit<RouteGuardProps, "roles" | "statuses">
) {
  return (
    <RouteGuard
      {...props}
      roles={["psychologist"]}
      statuses={["needs_profile"]}
      redirect="/psychologist/complete-profile"
    />
  );
}
