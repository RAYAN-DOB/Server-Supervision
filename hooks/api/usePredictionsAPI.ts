"use client";

import { useQuery } from "@tanstack/react-query";
import type { Prediction, AnomalyDetection } from "@/core/domain/entities";

interface PredictionResponse {
  siteId: string;
  siteName: string;
  predictions: Prediction[];
  anomalies: AnomalyDetection[];
  analyzedAt: string;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function usePredictions(siteId: string | null) {
  return useQuery<PredictionResponse>({
    queryKey: ["predictions", siteId],
    queryFn: () => fetchJSON(`/api/v1/predictions/${siteId}`),
    enabled: !!siteId,
    staleTime: 5 * 60_000,
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => fetchJSON("/api/v1/health"),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
