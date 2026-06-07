"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AurionLogo } from "@/components/features/aurion-logo";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { useState } from "react";

const navigation = [
  {
    name: "Supervision",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "État global DSI" },
      { name: "Sites supervisés", href: "/sites", icon: BookOpen, description: "HTDV, PLDS, sites DSI" },
      { name: "Alertes", href: "/alertes", icon: AlertTriangle, description: "Triggers Zabbix" },
    ],
  },
  {
    name: "Exploitation",
    items: [
      { name: "Lab Black Box", href: "/lab", icon: FlaskConical, description: "Site de validation" },
      { name: "Architecture", href: "/architecture", icon: Network, description: "Chaîne technique" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { alerts } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

  const handleNavigation = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-700 bg-slate-950/90 p-2 text-white lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <span className="block h-0.5 w-5 bg-white" />
        <span className="mt-1.5 block h-0.5 w-5 bg-white" />
        <span className="mt-1.5 block h-0.5 w-5 bg-white" />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-800 bg-[#07111f]/98 backdrop-blur-xl transition-all",
          collapsed ? "w-20" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="border-b border-slate-800 p-6">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <AurionLogo size="md" />
              <div>
                <h1 className="text-lg font-semibold text-white">AURION</h1>
                <p className="text-[11px] text-slate-500">Supervision DSI</p>
              </div>
            </Link>
          ) : (
            <div className="flex justify-center">
              <AurionLogo size="sm" />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navigation.map((section) => (
            <div key={section.name} className="mb-6">
              {!collapsed && (
                <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.name}
                </h2>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;
                  const alertCount = item.name === "Alertes" ? activeAlerts.length : 0;

                  return (
                    <Link key={item.href} href={item.href} onClick={handleNavigation}>
                      <div
                        title={collapsed ? item.name : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                          collapsed && "justify-center",
                          isActive
                            ? "border border-cyan-500/25 bg-cyan-500/10 text-white shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]"
                            : "text-slate-400 hover:bg-slate-900/70 hover:text-white"
                        )}
                      >
                        {isActive && (
                          <div className="absolute bottom-1.5 left-0 top-1.5 w-1 rounded-r-full bg-cyan-400" />
                        )}
                        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-cyan-300")} />
                        {!collapsed && (
                          <>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{item.name}</p>
                              <p className="truncate text-xs text-slate-600">{item.description}</p>
                            </div>
                            {alertCount > 0 && (
                              <Badge
                                variant={criticalAlerts.length > 0 ? "critical" : "warning"}
                                className="px-1.5 py-0.5 text-[10px]"
                              >
                                {alertCount}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="hidden border-t border-slate-800 p-4 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/70 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
