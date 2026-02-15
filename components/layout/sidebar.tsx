"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  AlertTriangle,
  BarChart3,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AurionLogo } from "@/components/aurion-logo";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { useState } from "react";

const navigation = [
  {
    name: "Vue d'Ensemble",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Vue globale" },
      { name: "Carte Interactive", href: "/carte", icon: MapPin, description: "Carte des sites" },
    ],
  },
  {
    name: "Infrastructure",
    items: [
      { name: "Tous les Sites", href: "/sites", icon: Building2, description: "12 sites" },
      { name: "Alertes", href: "/alertes", icon: AlertTriangle, description: "Centre d'alertes" },
      { name: "Historique", href: "/historique", icon: History, description: "Timeline" },
    ],
  },
  {
    name: "Analyses",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, description: "Graphiques" },
      { name: "Rapports", href: "/rapports", icon: FileText, description: "Exports PDF" },
    ],
  },
  {
    name: "Configuration",
    items: [
      { name: "Administration", href: "/admin", icon: Settings, description: "Paramètres" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { alerts } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");

  const handleNavigation = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: collapsed ? 80 : 280,
        }}
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-white/[0.06] bg-[#020208]/95 backdrop-blur-xl z-50 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform lg:transition-none"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06]">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-3 group">
              <AurionLogo size="md" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                  AURION
                </h1>
                <p className="text-[10px] text-gray-600 font-light">Supervision IT</p>
              </div>
            </Link>
          ) : (
            <div className="flex justify-center">
              <AurionLogo size="sm" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.name}>
              {!collapsed && (
                <h2 className="px-3 mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
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
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                          isActive
                            ? "bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        <Icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive && "text-purple-400"
                        )} />
                        
                        {!collapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-gray-600 truncate">{item.description}</p>
                            </div>
                            
                            {alertCount > 0 && (
                              <Badge
                                variant={criticalAlerts.length > 0 ? "critical" : "warning"}
                                className="text-[10px] px-1.5 py-0.5"
                              >
                                {alertCount}
                              </Badge>
                            )}
                          </>
                        )}

                        {collapsed && alertCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/[0.06] hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-gray-400 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Réduire</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
