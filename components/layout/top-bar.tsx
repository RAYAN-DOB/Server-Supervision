"use client";

import { Bell, Clock, Database, ShieldCheck, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/layout/user-menu";
import { StatusIndicator } from "@/components/features/status-indicator";
import { useStore } from "@/store/useStore";

export function TopBar() {
  const { alerts } = useStore();
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

  return (
    <div className="sticky top-0 z-30 border-b border-slate-800 bg-[#07111f]/92 backdrop-blur-xl">
      <div className="flex min-h-[56px] items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:block">
            Supervision DSI - Maisons-Alfort
          </p>
          <h2 className="truncate text-sm font-semibold text-slate-50 sm:text-base">
            AURION - Supervision environnementale
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 md:flex">
            <Wifi className="h-3.5 w-3.5" />
            En direct
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-200 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            SNMPv3 authPriv
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-300 xl:flex">
            <Database className="h-3.5 w-3.5 text-cyan-300" />
            API JSON-RPC
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 lg:flex">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-mono text-xs font-medium text-slate-300">{timeStr}</span>
          </div>

          <StatusIndicator />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/alertes")}
            title="Voir les alertes"
            className="relative rounded-xl p-2 transition-colors hover:bg-slate-900/80"
          >
            <Bell className="h-5 w-5 text-slate-400" />
            {activeAlerts.length > 0 && (
              <>
                <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                {criticalAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {criticalAlerts.length}
                  </span>
                )}
              </>
            )}
          </motion.button>

          <div className="h-5 w-px bg-slate-800" />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
