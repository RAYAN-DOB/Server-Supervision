"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Droplets,
  RefreshCw,
  Server,
  ShieldCheck,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import { PwaNotificationButton } from "@/components/features/pwa-notifications";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { Alert, Site } from "@/types";

type DemoStatus = "ok" | "warning" | "critical" | "maintenance";

interface DemoSensor {
  id: string;
  name: string;
  type: string;
  value: string;
  status: DemoStatus;
  lastUpdate: string;
  source: "zabbix" | "mock";
  zabbixItemId?: string;
  oidOrKey?: string;
}

interface DemoCheck {
  label: string;
  status: "ok" | "warning" | "critical";
  detail: string;
}

interface DemoPayload {
  site: Site;
  source: "zabbix" | "mock";
  connected: boolean;
  useMock: boolean;
  apiVersion?: string | null;
  zabbixHost?: {
    hostid: string;
    name: string;
    available: string;
  };
  sensors: DemoSensor[];
  alerts: Alert[];
  checks: DemoCheck[];
  explanation: string;
  lastSync: string;
  error?: string;
}

function statusClass(status: string) {
  if (status === "critical") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (status === "warning" || status === "major" || status === "minor") {
    return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  }
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

function statusLabel(status: string) {
  if (status === "critical") return "Critique";
  if (status === "warning" || status === "major") return "Warning";
  if (status === "minor") return "Mineure";
  if (status === "info") return "Info";
  return "OK";
}

function sensorIcon(type: string) {
  if (type === "temperature") return Thermometer;
  if (type === "humidity") return Droplets;
  if (type === "power") return Zap;
  if (type === "availability") return Wifi;
  return Activity;
}

function formatTime(value?: string) {
  if (!value) return "n/a";
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DemoLivePage() {
  const [data, setData] = useState<DemoPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/zabbix/demo", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = (await response.json()) as DemoPayload;
      setData(payload);

      const store = useStore.getState();
      store.setSites([
        ...store.sites.filter((site) => site.id !== payload.site.id),
        payload.site,
      ]);
      store.setAlerts([
        ...payload.alerts,
        ...store.alerts.filter((alert) => alert.siteId !== payload.site.id),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh]);

  const summary = useMemo(() => {
    const sensors = data?.sensors ?? [];
    return {
      ok: sensors.filter((sensor) => sensor.status === "ok").length,
      warning: sensors.filter((sensor) => sensor.status === "warning").length,
      critical: sensors.filter((sensor) => sensor.status === "critical").length,
    };
  }, [data]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Demonstration AURION
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Demo Live - site DEMO-LAB</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Le mini-lab est traite comme un vrai site supervise : gateway Black Box, capteur
              temperature/humidite, collecte SNMPv3, host Zabbix, items, triggers et lecture
              simplifiee dans AURION.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PwaNotificationButton
              alerts={data?.alerts ?? []}
              connected={Boolean(data?.connected)}
              lastSync={data?.lastSync}
            />
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Actualiser
            </button>
          </div>
        </header>

        {error && (
          <section className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
            Impossible de charger la demo : {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Site</span>
              <Server className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.site?.name ?? "Demo Lab"}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">ID : DEMO-LAB</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Zabbix</span>
              <Database className="h-4 w-4" />
            </div>
            <p className={cn("mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium", data?.connected ? statusClass("ok") : statusClass("warning"))}>
              {data?.connected ? "API connectee" : "Mode demo"}
            </p>
            <p className="mt-2 text-xs text-slate-500">Version : {data?.apiVersion ?? "mock"}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Capteurs</span>
              <Activity className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.sensors?.length ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">
              {summary.ok} OK - {summary.warning} warning - {summary.critical} critique
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Triggers</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.alerts?.length ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Derniere synchro : {formatTime(data?.lastSync)}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Valeurs capteurs remontees</h2>
                <p className="text-sm text-slate-500">
                  Source : {data?.source === "zabbix" ? "Zabbix API JSON-RPC" : "mode mock/demo"}
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-slate-400">
                Host : {data?.zabbixHost?.name ?? "BLACKBOX-DEMO"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(data?.sensors ?? []).map((sensor) => {
                const Icon = sensorIcon(sensor.type);
                return (
                  <article key={sensor.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{sensor.name}</h3>
                          <p className="mt-1 font-mono text-xs text-slate-500">{sensor.oidOrKey ?? sensor.zabbixItemId}</p>
                        </div>
                      </div>
                      <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", statusClass(sensor.status))}>
                        {statusLabel(sensor.status)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-white">{sensor.value}</p>
                      <p className="text-xs text-slate-500">{formatTime(sensor.lastUpdate)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Connexion de bout en bout</h2>
              <div className="space-y-3">
                {(data?.checks ?? []).map((check) => (
                  <div key={check.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    {check.status === "ok" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{check.label}</p>
                      <p className="text-xs leading-5 text-slate-500">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-semibold">Principe de demonstration</h2>
              </div>
              <p className="text-sm leading-6 text-emerald-50/85">
                La demo utilise le meme modele que le pilote : un host Zabbix, des items SNMP/OID,
                des triggers, puis une interface plus lisible pour la DSI. AURION ne collecte pas
                directement les capteurs, il lit Zabbix via API JSON-RPC.
              </p>
            </div>
          </aside>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Alertes / triggers du site DEMO-LAB</h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.05] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Niveau</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Capteur</th>
                  <th className="px-4 py-3">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(data?.alerts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Aucun trigger actif pour le site de demonstration.
                    </td>
                  </tr>
                ) : (
                  data!.alerts.map((alert) => (
                    <tr key={alert.id} className="bg-black/10">
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", statusClass(alert.severity))}>
                          {statusLabel(alert.severity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{alert.title}</td>
                      <td className="px-4 py-3 text-slate-400">{alert.sensorType ?? "Zabbix"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{formatTime(alert.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
