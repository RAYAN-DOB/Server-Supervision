"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mocks";
import { useEffect } from "react";
import type { Site } from "@/types";

async function loadSitesWithDemoLab(): Promise<Site[]> {
  const baseSites = MOCK_SITES.filter((site) => site.id !== "DEMO-LAB");

  try {
    const response = await fetch("/api/zabbix/demo", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    if (payload?.site) {
      return [...baseSites, payload.site as Site];
    }
  } catch {
    // Si la VM Zabbix ou le réseau local n'est pas disponible, on conserve un état
    // de secours cohérent pour que l'interface reste exploitable.
  }

  return MOCK_SITES;
}

export function useSites() {
  const { sites, setSites } = useStore();

  const query = useQuery({
    queryKey: ["sites"],
    queryFn: loadSitesWithDemoLab,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 15000,
    initialData: sites.length > 0 && sites.some((site) => site.id === "DEMO-LAB") ? sites : undefined,
  });

  useEffect(() => {
    if (query.data) {
      setSites(query.data);
    }
  }, [query.data, setSites]);

  return {
    sites: query.data || sites,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
