import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ProtectedRoute } from "@/components/features/protected-route";

export default function DashboardGroupLayout({
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
