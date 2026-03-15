"use client";

import { useQuery } from "@tanstack/react-query";
import type { SensorReading, SensorHistory, BayEntity } from "@/core/domain/entities";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function useSensorReadings(siteId: string | null) {
  return useQuery<{ siteId: string; sensors: SensorReading[]; count: number }>({
    queryKey: ["sensors", siteId],
    queryFn: () => fetchJSON(`/api/v1/sensors/${siteId}`),
    enabled: !!siteId,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useSensorHistory(
  siteId: string | null,
  options?: {
    type?: string;
    days?: number;
    aggregation?: "raw" | "hourly" | "daily";
    enabled?: boolean;
  }
) {
  const type = options?.type ?? "temperature";
  const days = options?.days ?? 7;
  const agg = options?.aggregation ?? "hourly";

  return useQuery<SensorHistory>({
    queryKey: ["sensors", siteId, "history", type, days, agg],
    queryFn: () =>
      fetchJSON(
        `/api/v1/sensors/${siteId}/history?type=${type}&days=${days}&aggregation=${agg}`
      ),
    enabled: !!siteId && (options?.enabled !== false),
    staleTime: 60_000,
  });
}

export function useBays(siteId: string | null) {
  return useQuery<{ siteId: string; bays: BayEntity[]; count: number }>({
    queryKey: ["bays", siteId],
    queryFn: () => fetchJSON(`/api/v1/sensors/${siteId}/bays`),
    enabled: !!siteId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
