"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, setCurrentUser } = useStore();
  const [checking, setChecking] = useState(!currentUser);

  useEffect(() => {
    if (currentUser) {
      setChecking(false);
      return;
    }

    const isLabRoute = pathname.startsWith("/lab") || pathname.startsWith("/demo");

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || isLabRoute) {
      setCurrentUser({
        id: isLabRoute ? "lab-blackbox-user" : "dsi-viewer",
        username: "technicien",
        email: "supervision@maisons-alfort.fr",
        name: "Technicien DSI",
        role: "viewer",
        department: "Supervision environnementale",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      setChecking(false);
      return;
    }

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
  }, [currentUser, pathname, router, setCurrentUser]);

  if (checking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
