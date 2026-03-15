import type { SiteReference, Site, SiteStatus } from "@/types";

const LOCAL_STORAGE_KEY = "aurion-site-references-overrides";

/**
 * Charge les sites du référentiel depuis /data/sites-reference.json
 * puis fusionne avec les overrides localStorage.
 */
export async function loadSiteReferences(): Promise<SiteReference[]> {
  try {
    const res = await fetch("/data/sites-reference.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const base: SiteReference[] = data.sites ?? [];

    const overrides = getLocalOverrides();
    return mergeWithOverrides(base, overrides);
  } catch (err) {
    console.error("[sitesRepository] Erreur chargement référentiel:", err);
    return [];
  }
}

/** Récupère les overrides locaux stockés dans localStorage */
function getLocalOverrides(): Partial<SiteReference>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SiteReference>[]) : [];
  } catch {
    return [];
  }
}

/** Fusionne la liste base avec les overrides (par ID) */
function mergeWithOverrides(
  base: SiteReference[],
  overrides: Partial<SiteReference>[]
): SiteReference[] {
  if (overrides.length === 0) return base;

  const overrideMap = new Map<string, Partial<SiteReference>>();
  for (const o of overrides) {
    if (o.id) overrideMap.set(o.id, o);
  }

  return base.map((site) => {
    const override = overrideMap.get(site.id);
    return override ? { ...site, ...override } : site;
  });
}

/**
 * Persiste un override d'un site dans localStorage.
 * Seuls les champs modifiés sont stockés (pas la donnée entière).
 */
export function saveSiteOverride(
  id: string,
  updates: Partial<SiteReference>
): void {
  if (typeof window === "undefined") return;

  const current = getLocalOverrides();
  const map = new Map(current.map((o) => [o.id!, o]));
  const existing = map.get(id) ?? { id };
  map.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });

  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(Array.from(map.values()))
  );
}

/** Supprime tous les overrides d'un site (restaure les données JSON) */
export function resetSiteOverride(id: string): void {
  if (typeof window === "undefined") return;

  const current = getLocalOverrides().filter((o) => o.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
}

/**
 * Fusionne les données de supervision (mock / Zabbix) dans le référentiel.
 * Règle : le référentiel a priorité sur les champs structurels,
 * les données live (status, température…) viennent de la supervision.
 */
export function mergeSitesWithReference(
  references: SiteReference[],
  supervisionSites: Site[]
): SiteReference[] {
  const supervisionMap = new Map(supervisionSites.map((s) => [s.id, s]));

  return references.map((ref) => {
    const sup = supervisionMap.get(ref.id);
    if (!sup) return ref;

    return {
      ...ref,
      supervisionStatus: sup.status as SiteStatus,
      supervisionLastUpdate: sup.lastUpdate,
      // Si Zabbix dit connected, on s'aligne
      zabbixStatus:
        ref.zabbixEnabled && sup.status !== "maintenance"
          ? ref.zabbixStatus
          : ref.zabbixStatus,
      sensorsStatus:
        sup.temperature > 0 && ref.sensorsStatus === "none"
          ? "active"
          : ref.sensorsStatus,
    };
  });
}
