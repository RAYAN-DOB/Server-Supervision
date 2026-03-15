"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SiteEntity, SiteWithSupervision } from "@/core/domain/entities";
import type { SiteStats } from "@/core/domain/repositories";
import type { SiteDetailData } from "@/core/use-cases";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function useAllSites() {
  return useQuery<{ sites: SiteEntity[]; count: number }>({
    queryKey: ["sites"],
    queryFn: () => fetchJSON("/api/v1/sites"),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSupervisedSites() {
  return useQuery<{ sites: SiteEntity[]; count: number }>({
    queryKey: ["sites", "supervised"],
    queryFn: () => fetchJSON("/api/v1/sites?supervised=true"),
    staleTime: 30_000,
  });
}

export function useSiteDetail(siteId: string | null) {
  return useQuery<SiteDetailData>({
    queryKey: ["site", siteId],
    queryFn: () => fetchJSON(`/api/v1/sites/${siteId}`),
    enabled: !!siteId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useSiteStats() {
  return useQuery<SiteStats>({
    queryKey: ["sites", "stats"],
    queryFn: () => fetchJSON("/api/v1/sites/stats"),
    staleTime: 60_000,
  });
}

export function useUpdateSite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SiteEntity> }) => {
      const res = await fetch(`/api/v1/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["site", id] });
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}
