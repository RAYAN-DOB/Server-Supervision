"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LoadingScreen } from "@/components/loading-screen";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (requiredRole && !requiredRole.includes(currentUser.role)) {
      router.push("/dashboard");
    }
  }, [currentUser, requiredRole, router]);

  if (!currentUser) {
    return <LoadingScreen />;
  }

  if (requiredRole && !requiredRole.includes(currentUser.role)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
