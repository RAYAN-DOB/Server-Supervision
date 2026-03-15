"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  AlertTriangle,
  Thermometer,
  Activity,
  Zap,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
  CheckCircle2,
  BookOpen,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { useSitesReference } from "@/hooks/useSitesReference";
import { MOCK_SITES, MOCK_ALERTS } from "@/data/mock-sites";
import { formatRelativeTime, cn } from "@/lib/utils";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BASE_TEMP_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}h`,
  temperature: +(22 + Math.sin((i / 24) * Math.PI * 2) * 2 + ((i * 7 + 3) % 10) / 20).toFixed(1),
}));

export default function DashboardPage() {
  const { sites, alerts, setSites, setAlerts } = useStore();
  const { stats: refStats, loading: refLoading } = useSitesReference();
  const [avgTemp, setAvgTemp] = useState(22.5);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (sites.length === 0) setSites(MOCK_SITES);
    if (alerts.length === 0) setAlerts(MOCK_ALERTS);

    const interval = setInterval(() => {
      setAvgTemp(+(22 + Math.sin(Date.now() / 10000) * 2).toFixed(1));
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [sites.length, alerts.length, setSites, setAlerts]);

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const totalBays = sites.reduce((sum, s) => sum + s.bayCount, 0);
  const avgUptime = useMemo(
    () => (sites.reduce((sum, s) => sum + s.uptime, 0) / (sites.length || 1)).toFixed(1),
    [sites]
  );

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [alerts]
  );

  const criticalSites = useMemo(
    () => sites.filter((s) => s.status === "critical" || s.status === "warning").slice(0, 4),
    [sites]
  );

  const stats = [
    {
      label: "Référentiel",
      value: refStats.total,
      sub: `${refStats.dsiManaged} gérés par la DSI`,
      icon: BookOpen,
      trend: `${refStats.connectedZabbix} Zabbix`,
      trendUp: true,
      accent: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/20",
      iconColor: "text-purple-400",
      href: "/sites",
    },
    {
      label: "Alertes actives",
      value: activeAlerts.length,
      sub: `${criticalAlerts.length} critique${criticalAlerts.length !== 1 ? "s" : ""}`,
      icon: AlertTriangle,
      trend: criticalAlerts.length > 0 ? "Action requise" : "Tout OK",
      trendUp: criticalAlerts.length === 0,
      accent: criticalAlerts.length > 0 ? "from-red-500/20 to-red-500/5" : "from-green-500/20 to-green-500/5",
      border: criticalAlerts.length > 0 ? "border-red-500/20" : "border-green-500/20",
      iconColor: criticalAlerts.length > 0 ? "text-red-400" : "text-green-400",
      href: "/alertes",
    },
    {
      label: "Température moy.",
      value: `${avgTemp}°C`,
      sub: "Sites supervisés",
      icon: Thermometer,
      trend: avgTemp > 24 ? "Élevée" : "Normale",
      trendUp: avgTemp <= 24,
      accent: avgTemp > 24 ? "from-orange-500/20 to-orange-500/5" : "from-green-500/20 to-green-500/5",
      border: avgTemp > 24 ? "border-orange-500/20" : "border-green-500/20",
      iconColor: avgTemp > 24 ? "text-orange-400" : "text-green-400",
      href: "/analytics",
    },
    {
      label: "Disponibilité",
      value: `${avgUptime}%`,
      sub: "30 derniers jours",
      icon: Activity,
      trend: parseFloat(avgUptime) >= 99.5 ? "Objectif atteint" : "À surveiller",
      trendUp: parseFloat(avgUptime) >= 99.5,
      accent: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-500/20",
      iconColor: "text-cyan-400",
      href: "/analytics",
    },
  ];

  const SEVERITY_DOT: Record<string, string> = {
    critical: "bg-red-500",
    major: "bg-orange-500",
    minor: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 scan-line">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            <span className="gradient-text-color">Command Center</span>
          </h1>
          <p className="text-sm text-gray-500 font-light flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              En direct
            </span>
            <span className="text-gray-700">·</span>
            <span>Mis à jour {formatRelativeTime(lastUpdate.toISOString())}</span>
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium",
          criticalAlerts.length > 0
            ? "border-red-500/30 bg-red-500/5 text-red-400"
            : "border-green-500/30 bg-green-500/5 text-green-400"
        )}>
          {criticalAlerts.length > 0 ? (
            <><AlertTriangle className="w-4 h-4" />{criticalAlerts.length} alerte{criticalAlerts.length > 1 ? "s" : ""} critique{criticalAlerts.length > 1 ? "s" : ""}</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" />Infrastructure opérationnelle</>
          )}
        </div>
      </motion.div>

      {/* KPI Cards — Holographic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={stat.href}>
                <div className={cn(
                  "holo-card relative overflow-hidden rounded-2xl border p-5 cursor-pointer group bg-gradient-to-br",
                  stat.accent,
                  stat.border,
                  stat.label === "Alertes actives" && criticalAlerts.length > 0 && "alert-glow-critical"
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl bg-white/[0.06] relative", stat.iconColor)}>
                      <Icon className="w-5 h-5 gauge-glow" />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.trendUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={stat.trendUp ? "text-green-400" : "text-red-400"}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight mb-0.5 neon-text">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-300 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500 font-light">{stat.sub}</div>
                  <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Graphique température */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="clean-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-white">Température sur 24h</h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">Moyenne consolidée tous sites</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-light">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                Temps réel
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={BASE_TEMP_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6A00FF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6A00FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="transparent" tick={{ fill: "#555", fontSize: 11 }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "#555", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,2,8,0.97)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "#fff",
                  }}
                  formatter={(v: number) => [`${v}°C`, "Température"]}
                />
                <Area type="monotone" dataKey="temperature" stroke="#6A00FF" strokeWidth={2} fill="url(#tempGrad)" dot={false} activeDot={{ r: 4, fill: "#6A00FF" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Résumé référentiel + accès rapide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          {/* Référentiel summary */}
          {!refLoading && (
            <div className="clean-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Référentiel
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Total sites", value: refStats.total, color: "text-white" },
                  { label: "Gérés DSI", value: refStats.dsiManaged, color: "text-violet-400" },
                  { label: "Avec Zabbix", value: refStats.connectedZabbix, color: "text-blue-400" },
                  { label: "Avec LT", value: refStats.withLT, color: "text-cyan-400" },
                  { label: "Adresses OK", value: refStats.addressVerified, color: "text-green-400" },
                  { label: "Sans GPS", value: refStats.withoutCoordinates, color: "text-orange-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 rounded-lg bg-white/[0.03]">
                    <p className="text-[10px] text-gray-600">{label}</p>
                    <p className={cn("text-lg font-bold", color)}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accès rapide */}
          <div className="clean-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Accès rapide</h3>
            <div className="space-y-1">
              {[
                { label: "Carte des sites", href: "/carte", icon: MapPin, sub: `${refStats.withCoordinates} géolocalisés` },
                { label: "Référentiel", href: "/sites", icon: BookOpen, sub: `${refStats.total} sites` },
                { label: "Centre d'alertes", href: "/alertes", icon: AlertTriangle, sub: `${activeAlerts.length} active${activeAlerts.length !== 1 ? "s" : ""}` },
                { label: "Analytics", href: "/analytics", icon: Activity, sub: "Graphiques" },
                { label: "Rapports", href: "/rapports", icon: Zap, sub: "Exports PDF / CSV" },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">{link.label}</p>
                        <p className="text-[11px] text-gray-600 font-light truncate">{link.sub}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes récentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="clean-card p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Alertes récentes</h3>
              <Link href="/alertes">
                <span className="text-xs text-gray-500 hover:text-purple-400 transition-colors">Tout voir →</span>
              </Link>
            </div>
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="w-10 h-10 text-green-500/40" />
                <p className="text-sm text-gray-600 font-light">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAlerts.map((alert, i) => (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0 relative", SEVERITY_DOT[alert.severity] ?? "bg-gray-500", (alert.severity === "critical" || alert.severity === "major") && "status-dot-pulse")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{alert.title}</p>
                      <p className="text-xs text-gray-600 font-light truncate">{alert.siteName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                        alert.severity === "critical" && "bg-red-500/15 text-red-400",
                        alert.severity === "major" && "bg-orange-500/15 text-orange-400",
                        alert.severity === "minor" && "bg-yellow-500/15 text-yellow-400",
                        alert.severity === "info" && "bg-blue-500/15 text-blue-400",
                      )}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{formatRelativeTime(alert.timestamp)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Sites à surveiller */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="clean-card p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Sites à surveiller</h3>
              <Link href="/sites">
                <span className="text-xs text-gray-500 hover:text-purple-400 transition-colors">Tout voir →</span>
              </Link>
            </div>
            {criticalSites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="w-10 h-10 text-green-500/40" />
                <p className="text-sm text-green-400/60 font-light">Tous les sites opérationnels</p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalSites.map((site, i) => (
                  <Link key={site.id} href={`/sites/${site.id}`}>
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 3 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/10 transition-colors">
                        <Building2 className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{site.name}</p>
                        <p className="text-xs text-gray-600 font-light">{site.alertCount} alerte{site.alertCount > 1 ? "s" : ""} · {site.temperature.toFixed(1)}°C</p>
                      </div>
                      <Badge variant={site.status as "ok" | "warning" | "critical" | "info" | "default"} className="text-[10px] flex-shrink-0">{site.status}</Badge>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
