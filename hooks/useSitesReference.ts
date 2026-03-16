"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { SiteReference } from "@/types";
import {
  loadSiteReferences,
  saveSiteOverride,
  resetSiteOverride,
} from "@/lib/data/sitesRepository";

// ─── Cache simple en mémoire (partagé entre instances du hook) ────────────────
let _cache: SiteReference[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return _cache !== null && Date.now() - _cacheTimestamp < CACHE_TTL_MS;
}

function setCache(data: SiteReference[]): void {
  _cache = data;
  _cacheTimestamp = Date.now();
}

function invalidateCache(): void {
  _cache = null;
  _cacheTimestamp = 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseSitesReferenceReturn {
  sites: SiteReference[];
  loading: boolean;
  error: string | null;
  reload: (force?: boolean) => Promise<void>;
  updateSite: (id: string, updates: Partial<SiteReference>) => void;
  resetSite: (id: string) => void;
  getSiteById: (id: string) => SiteReference | undefined;
  getSitesByCategory: (category: string) => SiteReference[];
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function loadWithRetry(attempt = 0): Promise<SiteReference[]> {
  try {
    return await loadSiteReferences();
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      return loadWithRetry(attempt + 1);
    }
    throw err;
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useSitesReference(): UseSitesReferenceReturn {
  const [sites, setSites] = useState<SiteReference[]>(
    isCacheValid() ? (_cache as SiteReference[]) : []
  );
  const [loading, setLoading] = useState(!isCacheValid());
  const [error, setError] = useState<string | null>(null);

  // Évite les double-chargements en mode Strict React
  const mountedRef = useRef(false);

  const reload = useCallback(async (force = false) => {
    // Servir depuis le cache si valide et non forcé
    if (!force && isCacheValid()) {
      setSites(_cache as SiteReference[]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loadWithRetry();
      setCache(data);
      setSites(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de charger le référentiel des sites.";
      setError(message);
      console.error("[useSitesReference]", err);

      // Fallback : utiliser le cache périmé si disponible
      if (_cache !== null) {
        setSites(_cache);
        setError("Données potentiellement obsolètes — rechargement échoué");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    reload();
  }, [reload]);

  const updateSite = useCallback(
    (id: string, updates: Partial<SiteReference>) => {
      saveSiteOverride(id, updates);
      setSites((prev) => {
        const next = prev.map((s) =>
          s.id === id
            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
            : s
        );
        // Mettre à jour le cache partagé
        if (_cache) {
          _cache = next;
        }
        return next;
      });
    },
    []
  );

  const resetSite = useCallback(
    (id: string) => {
      resetSiteOverride(id);
      invalidateCache();
      reload(true);
    },
    [reload]
  );

  const getSiteById = useCallback(
    (id: string) => sites.find((s) => s.id === id),
    [sites]
  );

  const getSitesByCategory = useCallback(
    (category: string) => sites.filter((s) => s.category === category),
    [sites]
  );

  // Mémoïser les stats pour éviter des re-renders inutiles
  const stats = useMemo(
    () => ({
      total: sites.length,
      withCoordinates: sites.filter((s) => s.lat != null && s.lng != null).length,
      withoutCoordinates: sites.filter((s) => s.lat == null || s.lng == null).length,
      withLT: sites.filter((s) => (s.ltCount ?? 0) > 0).length,
      withoutLT: sites.filter((s) => (s.ltCount ?? 0) === 0).length,
      connectedZabbix: sites.filter(
        (s) => s.zabbixStatus === "connected" || s.zabbixStatus === "partial"
      ).length,
      notConnectedZabbix: sites.filter(
        (s) => s.zabbixStatus === "not_connected"
      ).length,
      dsiManaged: sites.filter((s) => s.likelyManagedByDSI).length,
      addressVerified: sites.filter((s) => s.addressStatus === "verified").length,
      addressNeedsValidation: sites.filter(
        (s) => s.addressStatus === "needs_manual_validation"
      ).length,
    }),
    [sites]
  );

  return {
    sites,
    loading,
    error,
    reload,
    updateSite,
    resetSite,
    getSiteById,
    getSitesByCategory,
    stats,
  };
}
