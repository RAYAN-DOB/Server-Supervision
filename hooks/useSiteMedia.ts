"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteMedia } from "@/types";
import { getRealPhotosForSite, SITES_WITH_PHOTOS } from "@/data/site-photos";

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

  const reload = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);

    // 1. Vraies photos depuis GitHub (hardcodées dans site-photos.ts)
    if (SITES_WITH_PHOTOS.includes(siteId)) {
      const real = getRealPhotosForSite(siteId);
      if (real.length > 0) {
        setMedia(real);
        setLoading(false);
        return;
      }
    }

    // 2. Tenter l'API Prisma (si inventaire seedé en base)
    try {
      const res = await fetch(`/api/v1/sites/${siteId}/media`);
      if (res.ok) {
        const data = await res.json();
        const fetched: SiteMedia[] = data.media ?? [];
        if (fetched.length > 0) {
          setMedia(fetched);
          setLoading(false);
          return;
        }
      }
    } catch {
      // API indisponible, continuer
    }

    // 3. Aucune photo connue
    setMedia([]);
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const byType = useCallback(
    (type: string) => media.filter((m) => m.type === type),
    [media]
  );

  // Pour la page baie : filtre par bayName (ex: "LT-01") ou retourne tout
  const forBay = useCallback(
    (bayIdOrName: string) => {
      // Essai 1 : match sur bay.name exact
      const byBayName = media.filter(
        (m) => m.bay?.name === bayIdOrName || m.bay?.id === bayIdOrName
      );
      if (byBayName.length > 0) return byBayName;

      // Essai 2 : bay name contient le LT number (ex "LT-01" dans "LT - 01")
      const ltNum = bayIdOrName.replace(/[^0-9]/g, "");
      if (ltNum) {
        const byLt = media.filter(
          (m) => m.bay?.name?.replace(/[^0-9]/g, "") === ltNum
        );
        if (byLt.length > 0) return byLt;
      }

      // Essai 3 : retourner toutes les photos du site (site à une seule baie)
      return media;
    },
    [media]
  );

  return { media, loading, error, reload, byType, forBay };
}
