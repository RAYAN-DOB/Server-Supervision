import type { SiteMedia } from "@/types";

/**
 * Photos de datacenter / salles serveurs pour la galerie de démonstration.
 * Utilise Picsum Photos (service stable, images aléatoires mais consistantes par seed).
 *
 * Format : https://picsum.photos/seed/{seed}/800/600
 */

type MockMediaEntry = Omit<SiteMedia, "id" | "createdAt">;

// ─── Photos par type ──────────────────────────────────────────────────────────

const BAY_SEEDS = [
  "server-rack-htdv1",
  "server-rack-htdv2",
  "server-rack-plds1",
  "server-rack-plds2",
  "datacenter-bay-a",
  "datacenter-bay-b",
  "datacenter-bay-c",
  "rack-cables-blue",
  "rack-front-view",
  "rack-back-view",
];

const EQUIP_SEEDS = [
  "blackbox-sensor-a",
  "blackbox-sensor-b",
  "temp-humidity-unit",
  "smoke-detector-bay",
  "door-sensor-unit",
  "power-unit-rack",
  "patch-panel-close",
  "ups-unit-detail",
];

const LOCAL_SEEDS = [
  "lt-room-overview",
  "lt-room-entry",
  "lt-room-lighting",
  "lt-room-floor",
];

function picsumUrl(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// ─── Générateur de médias pour un site ───────────────────────────────────────

export function generateMockMediaForSite(
  siteId: string,
  bayIds: { id: string; name: string }[]
): SiteMedia[] {
  const now = new Date().toISOString();
  const items: SiteMedia[] = [];
  let counter = 0;

  const makeId = () => `mock-${siteId}-${++counter}`;

  // 2 photos du local technique
  LOCAL_SEEDS.slice(0, 2).forEach((seed, i) => {
    items.push({
      id: makeId(),
      url: picsumUrl(seed + "-" + siteId),
      type: "PHOTO_LOCAL",
      confidence: 0.92 - i * 0.05,
      siteId,
      localId: null,
      bayId: null,
      equipmentId: null,
      createdAt: now,
    });
  });

  // Pour chaque baie : 2 photos vue baie + 1 zoom équipement
  bayIds.forEach((bay, bayIndex) => {
    const offset = bayIndex * 3;

    // Vue baie
    items.push({
      id: makeId(),
      url: picsumUrl(BAY_SEEDS[offset % BAY_SEEDS.length] + "-" + siteId),
      type: "PHOTO_BAY",
      confidence: 0.95,
      siteId,
      localId: null,
      bayId: bay.id,
      equipmentId: null,
      createdAt: now,
      bay: { id: bay.id, name: bay.name },
    });

    items.push({
      id: makeId(),
      url: picsumUrl(BAY_SEEDS[(offset + 1) % BAY_SEEDS.length] + "-" + bay.id),
      type: "PHOTO_BAY",
      confidence: 0.88,
      siteId,
      localId: null,
      bayId: bay.id,
      equipmentId: null,
      createdAt: now,
      bay: { id: bay.id, name: bay.name },
    });

    // Zoom équipement BlackBox
    items.push({
      id: makeId(),
      url: picsumUrl(EQUIP_SEEDS[bayIndex % EQUIP_SEEDS.length] + "-" + bay.id),
      type: "ZOOM_EQUIPMENT",
      confidence: 0.85,
      siteId,
      localId: null,
      bayId: bay.id,
      equipmentId: null,
      createdAt: now,
      bay: { id: bay.id, name: bay.name },
    });
  });

  return items;
}

// ─── Médias filtrés pour une baie spécifique ──────────────────────────────────

export function getMockMediaForBay(
  allMedia: SiteMedia[],
  bayId: string
): SiteMedia[] {
  return allMedia.filter((m) => m.bayId === bayId || m.type === "PHOTO_LOCAL");
}
