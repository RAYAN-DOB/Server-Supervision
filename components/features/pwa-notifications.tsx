"use client";

import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Alert } from "@/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "aurion:pwa:notified-alerts:v1";

type PermissionState = NotificationPermission | "unsupported";

interface PwaNotificationButtonProps {
  alerts: Alert[];
  connected: boolean;
  lastSync?: string;
  className?: string;
}

function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function isNotifiable(alert: Alert) {
  return !alert.resolved && ["minor", "major", "critical"].includes(alert.severity);
}

function severityLabel(severity: Alert["severity"]) {
  if (severity === "critical") return "Critique";
  if (severity === "major") return "Warning";
  if (severity === "minor") return "Information";
  return "Info";
}

function buildBody(alert: Alert) {
  const details = [
    alert.siteName,
    alert.sensorType ? `capteur ${alert.sensorType}` : null,
    typeof alert.value === "number" ? `valeur ${alert.value}` : null,
  ].filter(Boolean);

  return `${alert.title}${details.length ? `\n${details.join(" - ")}` : ""}`;
}

async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    await navigator.serviceWorker.register("/sw.js");
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

async function showNotification(title: string, options: NotificationOptions) {
  const registration = await registerServiceWorker();

  if (registration?.showNotification) {
    await registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}

function loadSeenAlertIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function saveSeenAlertIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  const limited = Array.from(ids).slice(-80);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
}

export function PwaNotificationButton({
  alerts,
  connected,
  lastSync,
  className,
}: PwaNotificationButtonProps) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [pending, setPending] = useState(false);
  const seenAlertIds = useRef<Set<string>>(new Set());

  const activeAlerts = useMemo(() => alerts.filter(isNotifiable), [alerts]);

  useEffect(() => {
    if (!isSupported()) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
    seenAlertIds.current = loadSeenAlertIds();
    registerServiceWorker();
  }, []);

  const notifyAlert = useCallback(async (alert: Alert) => {
    if (!isSupported() || Notification.permission !== "granted") return;

    await showNotification(`AURION - ${severityLabel(alert.severity)}`, {
      body: buildBody(alert),
      tag: `aurion-alert-${alert.id}`,
      icon: "/aurion-icon.svg",
      badge: "/aurion-icon.svg",
      data: { url: "/alertes", alertId: alert.id },
      requireInteraction: alert.severity === "critical",
      silent: false,
    });
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    let changed = false;
    for (const alert of activeAlerts) {
      if (seenAlertIds.current.has(alert.id)) continue;
      seenAlertIds.current.add(alert.id);
      changed = true;
      notifyAlert(alert);
    }

    if (changed) saveSeenAlertIds(seenAlertIds.current);
  }, [activeAlerts, notifyAlert, permission]);

  const enableOrTest = useCallback(async () => {
    if (!isSupported()) {
      setPermission("unsupported");
      return;
    }

    setPending(true);
    try {
      await registerServiceWorker();

      const nextPermission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      setPermission(nextPermission);

      if (nextPermission === "granted") {
        await showNotification("AURION - Notifications actives", {
          body: connected
            ? `Le site DEMO-LAB est connecte a Zabbix. Derniere synchro : ${
                lastSync ? new Date(lastSync).toLocaleTimeString("fr-FR") : "en cours"
              }.`
            : "Le site DEMO-LAB fonctionne en mode laboratoire. Les pop-ups fonctionneront aussi avec les alertes Zabbix.",
          tag: "aurion-notifications-ready",
          icon: "/aurion-icon.svg",
          badge: "/aurion-icon.svg",
          data: { url: "/lab" },
        });
      }
    } finally {
      setPending(false);
    }
  }, [connected, lastSync]);

  const label =
    permission === "unsupported"
      ? "Notifications non supportees"
      : permission === "denied"
        ? "Notifications bloquees"
        : permission === "granted"
          ? activeAlerts.length > 0
            ? `${activeAlerts.length} alerte(s) suivie(s)`
            : "Tester notification"
          : "Activer alertes navigateur";

  const Icon =
    pending ? Loader2 : permission === "denied" || permission === "unsupported" ? BellOff : activeAlerts.length > 0 ? BellRing : Bell;

  return (
    <button
      type="button"
      onClick={enableOrTest}
      disabled={pending || permission === "unsupported"}
      title="Active les notifications navigateur pour les alertes AURION"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
        permission === "granted"
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
          : "border-violet-400/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/15",
        (permission === "denied" || permission === "unsupported") && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <Icon className={cn("h-4 w-4", pending && "animate-spin")} />
      {label}
    </button>
  );
}
