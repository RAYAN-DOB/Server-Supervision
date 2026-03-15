"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteReference } from "@/types";
import {
  loadSiteReferences,
  saveSiteOverride,
  resetSiteOverride,
} from "@/lib/data/sitesRepository";

export interface UseSitesReferenceReturn {
  sites: SiteReference[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateSite: (id: string, updates: Partial<SiteReference>) => void;
  resetSite: (id: string) => void;
  getSiteById: (id: string) => SiteReference | undefined;
  stats: {
    total: number;
    withCoordinates: number;
    withoutCoordinates: number;
    withLT: number;
    withoutLT: number;
    connectedZabbix: number;
    notConnectedZabbix: number;
    dsiManaged: number;
    addressVerified: number;
    addressNeedsValidation: number;
  };
}

export function useSitesReference(): UseSitesReferenceReturn {
  const [sites, setSites] = useState<SiteReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadSiteReferences();
      setSites(data);
    } catch (err) {
      setError("Impossible de charger le référentiel des sites.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateSite = useCallback(
    (id: string, updates: Partial<SiteReference>) => {
      saveSiteOverride(id, updates);
      setSites((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
            : s
        )
      );
    },
    []
  );

  const resetSite = useCallback(
    (id: string) => {
      resetSiteOverride(id);
      reload();
    },
    [reload]
  );

  const getSiteById = useCallback(
    (id: string) => sites.find((s) => s.id === id),
    [sites]
  );

  const stats = {
    total: sites.length,
    withCoordinates: sites.filter(
      (s) => s.lat != null && s.lng != null
    ).length,
    withoutCoordinates: sites.filter(
      (s) => s.lat == null || s.lng == null
    ).length,
    withLT: sites.filter((s) => (s.ltCount ?? 0) > 0).length,
    withoutLT: sites.filter((s) => (s.ltCount ?? 0) === 0).length,
    connectedZabbix: sites.filter(
      (s) => s.zabbixStatus === "connected" || s.zabbixStatus === "partial"
    ).length,
    notConnectedZabbix: sites.filter((s) => s.zabbixStatus === "not_connected")
      .length,
    dsiManaged: sites.filter((s) => s.likelyManagedByDSI).length,
    addressVerified: sites.filter((s) => s.addressStatus === "verified").length,
    addressNeedsValidation: sites.filter(
      (s) => s.addressStatus === "needs_manual_validation"
    ).length,
  };

  return {
    sites,
    loading,
    error,
    reload,
    updateSite,
    resetSite,
    getSiteById,
    stats,
  };
}
