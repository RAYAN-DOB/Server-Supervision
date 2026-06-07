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

type LabStatus = "ok" | "warning" | "critical" | "maintenance";

interface LabSensor {
  id: string;
  name: string;
  type: string;
  value: string;
  status: LabStatus;
  lastUpdate: string;
  source: "zabbix" | "mock";
  zabbixItemId?: string;
  oidOrKey?: string;
}

interface LabCheck {
  label: string;
  status: "ok" | "warning" | "critical";
  detail: string;
}

interface LabPayload {
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
  sensors: LabSensor[];
  alerts: Alert[];
  checks: LabCheck[];
  explanation: string;
  lastSync: string;
  error?: string;
}

function statusClass(status: string) {
  if (status === "critical") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (status === "warning" || status === "major" || status === "minor") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
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
  const [data, setData] = useState<LabPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/zabbix/demo", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = (await response.json()) as LabPayload;
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

  const temperatureSensor = data?.sensors.find((sensor) => sensor.type === "temperature");
  const humiditySensor = data?.sensors.find((sensor) => sensor.type === "humidity");

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Site supervisé AURION
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Lab Black Box</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Ce site reprend le même modèle que les salles serveurs : gateway Black Box,
              capteur température/humidité, collecte SNMPv3, host Zabbix, items, triggers
              et lecture simplifiée pour les techniciens DSI.
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Actualiser
            </button>
          </div>
        </header>

        {error && (
          <section className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
            Impossible de charger les données Zabbix : {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <article className="ops-card p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Site</span>
              <Server className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.site?.name ?? "Lab Black Box"}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">ID : DEMO-LAB</p>
          </article>

          <article className="ops-card p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Zabbix</span>
              <Database className="h-4 w-4" />
            </div>
            <p className={cn("mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium", data?.connected ? statusClass("ok") : statusClass("warning"))}>
              {data?.connected ? "Connecté API" : "Secours local"}
            </p>
            <p className="mt-2 text-xs text-slate-500">Version : {data?.apiVersion ?? "non disponible"}</p>
          </article>

          <article className="ops-card p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Température</span>
              <Thermometer className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{temperatureSensor?.value ?? "n/a"}</p>
            <p className="mt-1 text-xs text-slate-500">Capteur port 1 module 0</p>
          </article>

          <article className="ops-card p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">Humidité</span>
              <Droplets className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{humiditySensor?.value ?? "n/a"}</p>
            <p className="mt-1 text-xs text-slate-500">Dernière synchro : {formatTime(data?.lastSync)}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="ops-panel p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Valeurs capteurs remontées</h2>
                <p className="text-sm text-slate-500">
                  Source : {data?.source === "zabbix" ? "Zabbix API JSON-RPC" : "valeurs de secours"}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 font-mono text-xs text-slate-400">
                Host : {data?.zabbixHost?.name ?? "SP01C5B0"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(data?.sensors ?? []).map((sensor) => {
                const Icon = sensorIcon(sensor.type);
                return (
                  <article key={sensor.id} className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
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
          </article>

          <aside className="space-y-6">
            <article className="ops-panel p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Connexion de bout en bout</h2>
              <div className="space-y-3">
                {(data?.checks ?? []).map((check) => (
                  <div key={check.label} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-3">
                    {check.status === "ok" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{check.label}</p>
                      <p className="text-xs leading-5 text-slate-500">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-semibold">Principe d'exploitation</h2>
              </div>
              <p className="text-sm leading-6 text-emerald-50/85">
                AURION ne collecte pas directement les capteurs. La gateway Black Box expose les mesures,
                Zabbix les collecte en SNMPv3 authPriv, puis AURION les lit via l'API JSON-RPC.
              </p>
            </article>
          </aside>
        </section>

        <section className="ops-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Alertes / triggers du site DEMO-LAB</h2>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
              {summary.ok} OK · {summary.warning} warning · {summary.critical} critique
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Niveau</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Capteur</th>
                  <th className="px-4 py-3">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data?.alerts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Aucun trigger actif pour ce site.
                    </td>
                  </tr>
                ) : (
                  data!.alerts.map((alert) => (
                    <tr key={alert.id} className="bg-slate-950/30">
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
