"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Bell,
  History,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AurionLogo } from "@/components/aurion-logo";
import { UserMenu } from "@/components/user-menu";
import { useStore } from "@/store/useStore";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sites", href: "/sites", icon: Building2 },
  { name: "Carte", href: "/carte", icon: MapPin },
  { name: "Alertes", href: "/alertes", icon: AlertTriangle },
  { name: "Historique", href: "/historique", icon: History },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Rapports", href: "/rapports", icon: FileText },
  { name: "Admin", href: "/admin", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { alerts } = useStore();
  
  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020208]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <AurionLogo size="sm" />
            <div>
              <h1 className="text-base font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-nebula-violet group-hover:to-nebula-cyan transition-all duration-300">
                AURION
              </h1>
              <p className="text-[10px] text-gray-600 font-light">Maisons-Alfort</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const alertCount = item.name === "Alertes" ? activeAlerts.length : 0;
              
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2",
                      isActive 
                        ? "bg-white/[0.08] text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                    {alertCount > 0 && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                        criticalAlerts.length > 0 
                          ? "bg-red-500/20 text-red-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {alertCount}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nebula-violet to-nebula-cyan"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </motion.button>

            <div className="w-px h-6 bg-white/[0.06]" />

            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
