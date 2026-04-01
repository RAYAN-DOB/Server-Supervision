"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteMedia } from "@/types";

interface UseSiteMediaReturn {
  media: SiteMedia[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  byType: (type: string) => SiteMedia[];
}

export function useSiteMedia(siteId: string): UseSiteMediaReturn {
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/sites/${siteId}/media`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch (err) {
      console.error("[useSiteMedia]", err);
      setError("Impossible de charger la galerie.");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const byType = useCallback(
    (type: string) => media.filter((m) => m.type === type),
    [media]
  );

  return { media, loading, error, reload, byType };
}
