// =====================================================================
// FICHIER : lib/data/sitesRepository.ts
// ROLE DANS AURION : couche d'acces au "referentiel des sites" (la liste
//   des salles serveurs de la Ville et leurs caracteristiques).
// CE QU'IL RECOIT : un fichier JSON statique (sites-reference.json) +
//   d'eventuelles modifications manuelles de l'utilisateur (overrides).
// CE QU'IL PRODUIT : une liste de sites prete a afficher, en fusionnant
//   le JSON de base, les corrections locales (localStorage) et les
//   donnees de supervision live (status, temperature venant de Zabbix).
// POURQUOI localStorage : l'app tourne en LOCAL sur une VM ; on memorise
//   les corrections cote navigateur sans toucher au fichier d'origine.
// =====================================================================

import type { SiteReference, Site, SiteStatus } from "@/types";

// Cle de stockage navigateur ou l'on conserve les corrections manuelles.
const LOCAL_STORAGE_KEY = "aurion-site-references-overrides";

/**
 * Charge les sites du référentiel depuis /data/sites-reference.json
 * puis fusionne avec les overrides localStorage.
 */
export async function loadSiteReferences(): Promise<SiteReference[]> {
  try {
    // 1) On telecharge le fichier de reference servi par l'app (dossier public).
    const res = await fetch("/data/sites-reference.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const base: SiteReference[] = data.sites ?? []; // liste de base (?? [] = securite)

    // 2) On applique par-dessus les corrections locales de l'utilisateur.
    const overrides = getLocalOverrides();
    return mergeWithOverrides(base, overrides);
  } catch (err) {
    // En cas d'echec, on renvoie une liste vide plutot que de planter l'UI.
    console.error("[sitesRepository] Erreur chargement référentiel:", err);
    return [];
  }
}

/** Récupère les overrides locaux stockés dans localStorage */
function getLocalOverrides(): Partial<SiteReference>[] {
  // "window" n'existe pas cote serveur (Next.js SSR) : on protege l'acces a localStorage.
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
  if (overrides.length === 0) return base; // rien a fusionner

  // On indexe les overrides par identifiant de site pour une recherche rapide (O(1)).
  const overrideMap = new Map<string, Partial<SiteReference>>();
  for (const o of overrides) {
    if (o.id) overrideMap.set(o.id, o);
  }

  // Pour chaque site de base, on ecrase ses champs par ceux de l'override (s'il existe).
  // { ...site, ...override } : les valeurs de override remplacent celles de site.
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

  // On repart des overrides existants, indexes par id.
  const current = getLocalOverrides();
  const map = new Map(current.map((o) => [o.id!, o]));
  // Override existant pour ce site, sinon on en cree un minimal { id }.
  const existing = map.get(id) ?? { id };
  // On ajoute/met a jour les champs modifies + un horodatage de derniere modif.
  map.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() });

  // On re-serialise tous les overrides dans localStorage.
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(Array.from(map.values()))
  );
}

/** Supprime tous les overrides d'un site (restaure les données JSON) */
export function resetSiteOverride(id: string): void {
  if (typeof window === "undefined") return;

  // On garde tous les overrides SAUF celui du site demande (filter).
  // Le site revient ainsi a ses valeurs d'origine du JSON.
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
  // On indexe les sites supervises par id pour les retrouver vite.
  const supervisionMap = new Map(supervisionSites.map((s) => [s.id, s]));

  return references.map((ref) => {
    const sup = supervisionMap.get(ref.id);
    if (!sup) return ref; // aucune donnee live pour ce site -> on garde le referentiel tel quel

    // On enrichit le referentiel avec les donnees temps reel de la supervision.
    return {
      ...ref,
      // Etat et derniere mise a jour viennent de la supervision (Zabbix/mock).
      supervisionStatus: sup.status as SiteStatus,
      supervisionLastUpdate: sup.lastUpdate,
      // Le statut Zabbix reste celui du referentiel (champ structurel non ecrase ici).
      zabbixStatus:
        ref.zabbixEnabled && sup.status !== "maintenance"
          ? ref.zabbixStatus
          : ref.zabbixStatus,
      // Si la supervision remonte une temperature et que le referentiel ignorait
      // les capteurs ("none"), on bascule l'etat capteurs en "active".
      sensorsStatus:
        sup.temperature > 0 && ref.sensorsStatus === "none"
          ? "active"
          : ref.sensorsStatus,
    };
  });
}
