"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();
  const [checking, setChecking] = useState(!currentUser);

  useEffect(() => {
    if (currentUser) {
      setChecking(false);
      return;
    }

    // Restaurer la session depuis le cookie JWT (httpOnly, invisible côté client)
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setChecking(false);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [currentUser, router, setCurrentUser]);

  if (checking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
