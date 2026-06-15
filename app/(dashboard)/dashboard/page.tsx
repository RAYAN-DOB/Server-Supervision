// ============================================================================
// app/(dashboard)/dashboard/page.tsx — Tableau de bord principal d'AURION
// ----------------------------------------------------------------------------
// Rôle : page d'accueil de la supervision. Elle synthétise l'état des salles
// serveurs : indicateurs clés (KPI), liste des sites supervisés, courbe de
// température sur 24h, alertes récentes et sites à surveiller.
// Reçoit : les données du store global (sites + alertes, alimentés par les
// lectures Zabbix) et le référentiel DSI via le hook useSitesReference.
// Produit : l'interface de pilotage que consulte la DSI en un coup d'œil.
// NB : "use client" = composant exécuté côté navigateur (hooks, état, animations).
// ============================================================================

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  Droplets,
  Flame,
  ShieldCheck,
  Thermometer,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SITE_BB_EQUIPMENT, hasSensorType } from "@/lib/blackbox-refs";
import { Badge } from "@/components/ui/badge";
import { MOCK_ALERTS, MOCK_SITES } from "@/data/mocks";
import { useSitesReference } from "@/hooks/useSitesReference";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useStore } from "@/store/useStore";

// Données de démonstration de la courbe de température 24h : 24 points (un par
// heure). La sinusoïde simule le cycle jour/nuit autour de 22°C ; remplacé en
// production par l'historique réel renvoyé par Zabbix.
const BASE_TEMP_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}h`,
  temperature: +(22 + Math.sin((i / 24) * Math.PI * 2) * 1.6 + ((i * 7 + 3) % 8) / 20).toFixed(1),
}));

// Couleur de la pastille selon la gravité de l'alerte (du plus grave au plus léger)
const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  major: "bg-orange-500",
  minor: "bg-yellow-500",
  info: "bg-sky-500",
};

// Renvoie les classes Tailwind (couleur rouge/ambre/vert) selon le statut.
// Centralise le code couleur pour rester cohérent dans toute la page.
function statusTone(status: string) {
  if (status === "critical") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (status === "warning") return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

export default function DashboardPage() {
  // sites/alerts viennent du store global ; setSites/setAlerts servent à l'initialiser
  const { sites, alerts, setSites, setAlerts } = useStore();
  // Statistiques du référentiel DSI (nombre de sites, connectés Zabbix, etc.)
  const { stats: refStats, loading: refLoading } = useSitesReference();
  // Horodatage du dernier rafraîchissement affiché ("Mis à jour il y a X")
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Au montage : on amorce le store avec des données de démo si vide, puis on
  // déclenche un "tick" toutes les 15s pour rafraîchir l'horodatage affiché.
  useEffect(() => {
    if (sites.length === 0 || !sites.some((site) => site.id === "DEMO-LAB")) {
      setSites(MOCK_SITES);
    }
    if (alerts.length === 0 || !alerts.some((alert) => alert.siteId === "DEMO-LAB")) {
      setAlerts(MOCK_ALERTS);
    }

    const timer = setInterval(() => setLastUpdate(new Date()), 15000);
    // Nettoyage : on arrête le minuteur quand la page est démontée
    return () => clearInterval(timer);
  }, [alerts, alerts.length, setAlerts, setSites, sites, sites.length]);

  // Filet de sécurité : si le store est vide, on affiche les données de démo
  const visibleSites = sites.length > 0 ? sites : MOCK_SITES;
  const visibleAlerts = alerts.length > 0 ? alerts : MOCK_ALERTS;

  // Alertes actives = ni acquittées ni résolues ; dont on isole les critiques
  const activeAlerts = visibleAlerts.filter((alert) => !alert.acknowledged && !alert.resolved);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical");
  // Sites à surveiller = en état critique ou warning, limités aux 4 premiers
  const sitesToWatch = visibleSites
    .filter((site) => site.status === "critical" || site.status === "warning")
    .slice(0, 4);

  // Température moyenne de tous les sites (useMemo = recalcul seulement si les sites changent)
  const avgTemp = useMemo(() => {
    // On ne garde que les valeurs numériques valides, puis on calcule la moyenne
    const values = visibleSites.map((site) => site.temperature).filter(Number.isFinite);
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [visibleSites]);

  // Disponibilité (uptime) moyenne, formatée à 1 décimale (ex : "99.8")
  const avgUptime = useMemo(() => {
    const values = visibleSites.map((site) => site.uptime).filter(Number.isFinite);
    if (values.length === 0) return "0.0";
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  }, [visibleSites]);

  // 5 alertes les plus récentes : on trie par date décroissante puis on coupe à 5
  const recentAlerts = useMemo(
    () =>
      [...visibleAlerts]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [visibleAlerts]
  );

  // Définition des 4 cartes d'indicateurs (KPI) affichées en haut de page.
  // Chaque KPI = valeur calculée + libellé + icône + lien + code couleur (tone)
  // qui change selon les seuils (ex : rouge si alertes critiques, ambre si >=27°C).
  const kpis = [
    {
      label: "Sites DSI",
      value: refStats.total,
      sub: `${refStats.connectedZabbix} connectés Zabbix`,
      icon: BookOpen,
      href: "/sites",
      tone: "border-sky-500/25 bg-sky-500/10 text-sky-300",
      trend: `${refStats.dsiManaged} gérés`,
    },
    {
      label: "Alertes actives",
      value: activeAlerts.length,
      sub: `${criticalAlerts.length} critique${criticalAlerts.length > 1 ? "s" : ""}`,
      icon: AlertTriangle,
      href: "/alertes",
      tone: criticalAlerts.length > 0 ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      trend: criticalAlerts.length > 0 ? "Action requise" : "Tout OK",
    },
    {
      label: "Température moyenne",
      value: `${avgTemp.toFixed(1)} °C`,
      sub: "HTDV, PLDS, Lab Black Box",
      icon: Thermometer,
      href: "/sites",
      tone: avgTemp >= 27 ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      trend: avgTemp >= 27 ? "À surveiller" : "Normale",
    },
    {
      label: "Disponibilité",
      value: `${avgUptime}%`,
      sub: "Derniers relevés",
      icon: Activity,
      href: "/architecture",
      tone: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
      trend: parseFloat(avgUptime) >= 99.5 ? "Objectif atteint" : "Suivi renforcé",
    },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Supervision DSI - Maisons-Alfort
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Vue d'exploitation AURION
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Lecture synthétique des sites supervisés, des capteurs Black Box, des alertes Zabbix
              et de l'état de la chaîne SNMPv3 / API JSON-RPC.
            </p>
          </div>

          <div className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium", criticalAlerts.length > 0 ? statusTone("critical") : statusTone("ok"))}>
            {criticalAlerts.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {criticalAlerts.length > 0
              ? `${criticalAlerts.length} alerte critique`
              : "Infrastructure opérationnelle"}
          </div>
        </motion.header>

        {/* Bandeau des 4 KPI : on déroule le tableau kpis défini plus haut */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={kpi.href}>
                  <article className="ops-card group h-full p-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <span className={cn("rounded-xl border p-2.5", kpi.tone)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-3xl font-semibold tracking-tight text-white">{kpi.value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">{kpi.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
                    <ChevronRight className="absolute bottom-5 right-5 h-4 w-4 text-slate-600 transition group-hover:text-slate-300" />
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </section>

        <section className="ops-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <h2 className="text-sm font-semibold text-white">Sites supervisés actifs</h2>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200">
                HTDV / PLDS / Lab
              </span>
            </div>
            <Link href="/sites" className="text-xs text-slate-500 transition hover:text-cyan-300">
              Détails →
            </Link>
          </div>

          {/* Une carte par site équipé Black Box (référentiel SITE_BB_EQUIPMENT) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {Object.entries(SITE_BB_EQUIPMENT).map(([siteId, bays]) => {
              // On retrouve les mesures temps réel du site correspondant
              const site = visibleSites.find((candidate) => candidate.id === siteId);
              const temp = site?.temperature;
              // Seuils de température : >=30°C critique, >=27°C warning, sinon OK
              const tempStatus = temp == null ? "ok" : temp >= 30 ? "critical" : temp >= 27 ? "warning" : "ok";
              // Quels types de capteurs ce site possède (d'après le référentiel)
              const sensors = {
                temperature: hasSensorType(siteId, "temperature"),
                humidity: hasSensorType(siteId, "humidity"),
                smoke: hasSensorType(siteId, "smoke"),
                water: hasSensorType(siteId, "water"),
                door: hasSensorType(siteId, "door"),
              };

              return (
                <Link key={siteId} href={`/sites/${siteId}`}>
                  <article className="rounded-2xl border border-slate-800/90 bg-slate-950/45 p-4 transition hover:border-cyan-400/25 hover:bg-slate-900/60">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{site?.name ?? siteId}</p>
                          <p className="text-xs text-slate-500">{bays[0]?.bayPrefix ?? "Local technique"}</p>
                        </div>
                      </div>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", statusTone(tempStatus))}>
                        {tempStatus === "ok" ? "OK" : tempStatus === "warning" ? "Warning" : "Critique"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {sensors.temperature && (
                        <span className="inline-flex items-center gap-1">
                          <Thermometer className="h-3 w-3 text-amber-300" />
                          {temp == null ? "n/a" : `${temp.toFixed(1)} °C`}
                        </span>
                      )}
                      {sensors.humidity && (
                        <span className="inline-flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-cyan-300" />
                          {site == null ? "n/a" : `${site.humidity.toFixed(0)} %`}
                        </span>
                      )}
                      {sensors.smoke && (
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3 text-slate-500" />
                          Fumée
                        </span>
                      )}
                      {sensors.door && (
                        <span className="inline-flex items-center gap-1">
                          <DoorOpen className="h-3 w-3 text-slate-500" />
                          Porte
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[10px] text-slate-600">
                      {bays.flatMap((bay) => bay.refs).length} capteurs Black Box documentés
                    </p>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="ops-panel p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Température sur 24h</h2>
                <p className="mt-1 text-xs text-slate-500">Tendance consolidée des sites supervisés</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-emerald-300">
                <Wifi className="h-3.5 w-3.5" />
                Mis à jour {formatRelativeTime(lastUpdate.toISOString())}
              </span>
            </div>

            {/* Graphique d'aire (recharts) : courbe de température sur 24h */}
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={BASE_TEMP_DATA} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.98)",
                    border: "1px solid rgba(34,211,238,0.18)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value} °C`, "Température"]}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#tempGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          <aside className="space-y-4">
            {!refLoading && (
              <article className="ops-panel p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                  Référentiel DSI
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Total sites", refStats.total, "text-white"],
                    ["Gérés DSI", refStats.dsiManaged, "text-cyan-300"],
                    ["Avec Zabbix", refStats.connectedZabbix, "text-sky-300"],
                    ["Adresses OK", refStats.addressVerified, "text-emerald-300"],
                  ].map(([label, value, color]) => (
                    <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
                      <p className="text-[10px] text-slate-500">{label}</p>
                      <p className={cn("text-xl font-semibold", color as string)}>{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            <article className="ops-panel p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">Accès rapide</h2>
              {[
                { label: "Sites supervisés", href: "/sites", icon: Building2, sub: "HTDV, PLDS, Lab Black Box" },
                { label: "Lab Black Box", href: "/lab", icon: Wifi, sub: "Validation Zabbix / SNMPv3" },
                { label: "Centre d'alertes", href: "/alertes", icon: AlertTriangle, sub: `${activeAlerts.length} active${activeAlerts.length > 1 ? "s" : ""}` },
                { label: "Architecture", href: "/architecture", icon: ShieldCheck, sub: "Chaîne technique complète" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-800/45">
                    <span className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-400 transition group-hover:border-cyan-400/30 group-hover:text-cyan-300">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-200">{item.label}</span>
                      <span className="block truncate text-[11px] text-slate-600">{item.sub}</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-700 transition group-hover:text-slate-400" />
                  </Link>
                );
              })}
            </article>
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bloc "Alertes récentes" : message vide si aucune, sinon la liste des 5 dernières */}
          <article className="ops-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Alertes récentes</h2>
              <Link href="/alertes" className="text-xs text-slate-500 transition hover:text-cyan-300">
                Tout voir →
              </Link>
            </div>
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-400/45" />
                <p className="text-sm text-slate-500">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-800/35">
                    <span className={cn("h-2 w-2 rounded-full", severityDot[alert.severity] ?? "bg-slate-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-200">{alert.title}</span>
                      <span className="block truncate text-xs text-slate-600">{alert.siteName}</span>
                    </span>
                    <span className="text-xs text-slate-600">{formatRelativeTime(alert.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Bloc "Sites à surveiller" : sites en warning/critique calculés plus haut */}
          <article className="ops-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Sites à surveiller</h2>
              <Link href="/sites" className="text-xs text-slate-500 transition hover:text-cyan-300">
                Tout voir →
              </Link>
            </div>
            {sitesToWatch.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-400/45" />
                <p className="text-sm text-emerald-300/70">Tous les sites sont opérationnels</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sitesToWatch.map((site) => (
                  <Link key={site.id} href={`/sites/${site.id}`} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-800/35">
                    <span className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-200">{site.name}</span>
                      <span className="block text-xs text-slate-600">
                        {site.alertCount} alerte{site.alertCount > 1 ? "s" : ""} · {site.temperature.toFixed(1)} °C
                      </span>
                    </span>
                    <Badge variant={site.status as "ok" | "warning" | "critical" | "info" | "default"}>
                      {site.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
