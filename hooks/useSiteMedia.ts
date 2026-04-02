"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteMedia } from "@/types";
import { generateMockMediaForSite, getMockMediaForBay } from "@/data/mocks";
import { generateBaysForSite } from "@/data/mocks";
import { useStore } from "@/store/useStore";

interface UseSiteMediaReturn {
  media: SiteMedia[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  byType: (type: string) => SiteMedia[];
  forBay: (bayId: string) => SiteMedia[];
}

export function useSiteMedia(siteId: string): UseSiteMediaReturn {
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sites } = useStore();

  const reload = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/sites/${siteId}/media`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fetched: SiteMedia[] = data.media ?? [];

      if (fetched.length > 0) {
        setMedia(fetched);
      } else {
        // Fallback : générer des médias de démonstration depuis les baies mockées
        const site = sites.find((s) => s.id === siteId);
        if (site) {
          const bays = generateBaysForSite(site.id, site.name, site.bayCount);
          const mockMedia = generateMockMediaForSite(
            siteId,
            bays.map((b) => ({ id: b.id, name: b.name }))
          );
          setMedia(mockMedia);
        } else {
          setMedia([]);
        }
      }
    } catch (err) {
      console.warn("[useSiteMedia] API non disponible, utilisation des médias mockés.", err);
      // En cas d'erreur réseau, utiliser les mocks
      const site = sites.find((s) => s.id === siteId);
      if (site) {
        const bays = generateBaysForSite(site.id, site.name, site.bayCount);
        const mockMedia = generateMockMediaForSite(
          siteId,
          bays.map((b) => ({ id: b.id, name: b.name }))
        );
        setMedia(mockMedia);
        setError(null); // On a des données, pas d'erreur à afficher
      } else {
        setError(null);
        setMedia([]);
      }
    } finally {
      setLoading(false);
    }
  }, [siteId, sites]);

  useEffect(() => {
    reload();
  }, [reload]);

  const byType = useCallback(
    (type: string) => media.filter((m) => m.type === type),
    [media]
  );

  const forBay = useCallback(
    (bayId: string) => getMockMediaForBay(media, bayId),
    [media]
  );

  return { media, loading, error, reload, byType, forBay };
}
