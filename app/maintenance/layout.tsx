import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ProtectedRoute } from "@/components/protected-route";

export const metadata: Metadata = {
  title: "Gestion des Maintenances — AURION",
  description: "Planification et suivi des interventions sur les sites municipaux de Maisons-Alfort",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
          <TopBar />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
