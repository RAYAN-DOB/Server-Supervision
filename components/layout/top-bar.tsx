"use client";

import { Bell, Search, Command } from "lucide-react";
import { motion } from "framer-motion";
import { UserMenu } from "@/components/user-menu";
import { StatusIndicator } from "@/components/status-indicator";
import { useStore } from "@/store/useStore";
import { useState } from "react";

export function TopBar() {
  const { alerts } = useStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#020208]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 min-h-[52px]">
        {/* Search */}
        <div className="flex-1 min-w-0 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher... (Ctrl+K)"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-16 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-light"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-white/[0.04] border border-white/[0.06] rounded">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-white/[0.04] border border-white/[0.06] rounded">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: status + notifications + user — tout en ligne, sans chevauchement */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* En Direct */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shrink-0">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500 shrink-0"
            />
            <span className="text-xs font-medium text-green-400 whitespace-nowrap">En Direct</span>
          </div>

          {/* En ligne + Dernière synchro */}
          <StatusIndicator />

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors shrink-0"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {activeAlerts.length > 0 && (
              <>
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {criticalAlerts.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {criticalAlerts.length}
                  </motion.span>
                )}
              </>
            )}
          </motion.button>

          <div className="w-px h-5 bg-white/[0.06] shrink-0 self-stretch" />

          {/* User Menu */}
          <div className="shrink-0 min-w-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
