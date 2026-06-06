"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { MOCK_ALERTS } from "@/data/mocks";
import { useEffect } from "react";
import type { Alert } from "@/types";

async function loadAlertsWithDemoLab(): Promise<Alert[]> {
  const baseAlerts = MOCK_ALERTS.filter((alert) => alert.siteId !== "DEMO-LAB");

  try {
    const response = await fetch("/api/zabbix/demo", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const labAlerts = Array.isArray(payload?.alerts) ? (payload.alerts as Alert[]) : [];
    return [...labAlerts, ...baseAlerts];
  } catch {
    return baseAlerts;
  }
}

export function useAlerts() {
  const { alerts, setAlerts } = useStore();

  const query = useQuery({
    queryKey: ["alerts"],
    queryFn: loadAlertsWithDemoLab,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    initialData: alerts.length > 0 ? alerts : undefined,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (query.data) {
      setAlerts(query.data);
    }
  }, [query.data, setAlerts]);

  return {
    alerts: query.data || alerts,
    activeAlerts: (query.data || alerts).filter((a) => !a.acknowledged && !a.resolved),
    criticalAlerts: (query.data || alerts).filter((a) => a.severity === "critical" && !a.acknowledged),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
