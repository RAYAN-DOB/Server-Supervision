"use client";

import { Bell, Search, Command } from "lucide-react";
import { motion } from "framer-motion";
import { UserMenu } from "@/components/user-menu";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function TopBar() {
  const { alerts } = useStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#020208]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
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

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className="text-xs font-medium text-green-400">En Direct</span>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {activeAlerts.length > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {criticalAlerts.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {criticalAlerts.length}
                  </motion.span>
                )}
              </>
            )}
          </motion.button>

          <div className="w-px h-6 bg-white/[0.06]" />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
