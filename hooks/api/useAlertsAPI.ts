"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AlertEntity } from "@/core/domain/entities";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function useAlerts(options?: { active?: boolean; siteId?: string }) {
  const params = new URLSearchParams();
  if (options?.active) params.set("active", "true");
  if (options?.siteId) params.set("siteId", options.siteId);
  const qs = params.toString();

  return useQuery<{ alerts: AlertEntity[]; count: number }>({
    queryKey: ["alerts", options],
    queryFn: () => fetchJSON(`/api/v1/alerts${qs ? `?${qs}` : ""}`),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useAlertStats() {
  return useQuery<{
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    critical: number;
  }>({
    queryKey: ["alerts", "stats"],
    queryFn: () => fetchJSON("/api/v1/alerts/stats"),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, userName }: { alertId: string; userName: string }) => {
      const res = await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur lors de l'acquittement");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`/api/v1/alerts/${alertId}/resolve`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur lors de la résolution");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
