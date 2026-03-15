"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bell,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { MOCK_ALERTS } from "@/data/mock-sites";
import { formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const SEVERITY_CONFIG = {
  critical: { label: "Critique", dot: "bg-red-500", badge: "bg-red-500/15 text-red-400 border-red-500/20", border: "border-l-red-500" },
  major:    { label: "Majeure",  dot: "bg-orange-500", badge: "bg-orange-500/15 text-orange-400 border-orange-500/20", border: "border-l-orange-500" },
  minor:    { label: "Mineure",  dot: "bg-yellow-500", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", border: "border-l-yellow-500" },
  info:     { label: "Info",     dot: "bg-blue-500",   badge: "bg-blue-500/15 text-blue-400 border-blue-500/20", border: "border-l-blue-500" },
};

export default function AlertesPage() {
  const { alerts, setAlerts, acknowledgeAlert, currentUser } = useStore();
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (alerts.length === 0) setAlerts(MOCK_ALERTS);
  }, [alerts.length, setAlerts]);

  const filteredAlerts = alerts
    .filter((a) => {
      if (!showAcknowledged && a.acknowledged) return false;
      if (filterSeverity.length > 0 && !filterSeverity.includes(a.severity)) return false;
      return true;
    })
    .sort((a, b) => {
      const order = { critical: 0, major: 1, minor: 2, info: 3 };
      return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
    });

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);
  const counts = {
    critical: activeAlerts.filter((a) => a.severity === "critical").length,
    major:    activeAlerts.filter((a) => a.severity === "major").length,
    minor:    activeAlerts.filter((a) => a.severity === "minor").length,
    ack:      alerts.filter((a) => a.acknowledged).length,
  };

  const handleAcknowledge = (alertId: string) => {
    if (!currentUser) { toast.error("Vous devez être connecté"); return; }
    acknowledgeAlert(alertId, currentUser.name);
    toast.success("Alerte acquittée");
    setExpandedId(null);
  };

  const toggleSeverity = (s: string) => {
    setFilterSeverity((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Centre d'Alertes</h1>
        <p className="text-sm text-gray-500 font-light">
          {activeAlerts.length} alerte{activeAlerts.length !== 1 ? "s" : ""} active{activeAlerts.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critiques",   value: counts.critical, color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: AlertTriangle },
          { label: "Majeures",    value: counts.major,    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Bell },
          { label: "Mineures",    value: counts.minor,    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
          { label: "Acquittées",  value: counts.ack,      color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              className={cn("rounded-2xl border p-5 flex items-center justify-between", s.bg, s.border)}
            >
              <div>
                <p className="text-xs text-gray-500 font-light mb-1">{s.label}</p>
                <p className={cn("text-3xl font-bold tracking-tight", s.color)}>{s.value}</p>
              </div>
              <Icon className={cn("w-7 h-7 opacity-50", s.color)} />
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="clean-card p-4 mb-6 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-xs text-gray-500 font-light">Filtrer :</span>

        <div className="flex flex-wrap gap-2">
          {(["critical", "major", "minor", "info"] as const).map((sev) => {
            const cfg = SEVERITY_CONFIG[sev];
            const active = filterSeverity.includes(sev);
            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  active
                    ? cn(cfg.badge, "border")
                    : "bg-white/[0.03] text-gray-500 border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              showAcknowledged
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-white/[0.03] text-gray-500 border-white/[0.06] hover:bg-white/[0.06]"
            )}
          >
            {showAcknowledged ? "Masquer acquittées" : "Voir acquittées"}
          </button>
          <Button variant="glass" size="sm" onClick={() => toast.info("Export en cours...")}>
            <Download className="w-4 h-4 mr-1.5" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredAlerts.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info;
            const isExpanded = expandedId === alert.id;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.025 }}
                className={cn(
                  "clean-card overflow-hidden border-l-2 transition-all",
                  cfg.border,
                  alert.acknowledged && "opacity-50"
                )}
              >
                {/* Row principale */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot, !alert.acknowledged && "animate-pulse")} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold border", cfg.badge)}>
                        {cfg.label}
                      </span>
                      {alert.acknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Acquittée
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{alert.title}</p>
                    <p className="text-xs text-gray-500 font-light truncate">{alert.siteName}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-600 hidden sm:block whitespace-nowrap">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                    {!alert.acknowledged && (
                      <Button
                        variant="glass"
                        size="sm"
                        className="text-xs h-7 px-3"
                        onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Acquitter
                      </Button>
                    )}
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-600" />
                      : <ChevronDown className="w-4 h-4 text-gray-600" />
                    }
                  </div>
                </div>

                {/* Détails dépliables */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.05] px-4 pb-4 pt-3"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: "Site", value: alert.siteName },
                          { label: "Baie", value: alert.bayName ?? "—" },
                          { label: "Capteur", value: alert.sensorType ?? "—" },
                          { label: "Valeur", value: alert.value != null ? `${alert.value}${alert.threshold ? ` / seuil ${alert.threshold}` : ""}` : "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg bg-white/[0.03] p-2.5">
                            <p className="text-gray-600 mb-0.5">{label}</p>
                            <p className="text-gray-300 font-medium truncate">{value}</p>
                          </div>
                        ))}
                      </div>
                      {alert.description && (
                        <p className="text-xs text-gray-500 mt-3 font-light">{alert.description}</p>
                      )}
                      {alert.acknowledged && alert.acknowledgedBy && (
                        <p className="text-xs text-green-400/70 mt-2">
                          Acquittée par <span className="font-medium">{alert.acknowledgedBy}</span>
                          {alert.acknowledgedAt && <> · {formatRelativeTime(alert.acknowledgedAt)}</>}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="clean-card p-16 text-center"
          >
            <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-green-500/30" />
            <h3 className="text-lg font-semibold text-white mb-1">Aucune alerte</h3>
            <p className="text-sm text-gray-600 font-light">
              {filterSeverity.length > 0
                ? "Aucune alerte ne correspond aux filtres sélectionnés"
                : "Toutes les alertes ont été acquittées"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
