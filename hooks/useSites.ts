"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mock-sites";
import { useEffect } from "react";

export function useSites() {
  const { sites, setSites } = useStore();

  const query = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      // In production, fetch from Zabbix API
      // const response = await fetch('/api/zabbix/hosts');
      // return response.json();
      return MOCK_SITES;
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    initialData: sites.length > 0 ? sites : undefined,
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
