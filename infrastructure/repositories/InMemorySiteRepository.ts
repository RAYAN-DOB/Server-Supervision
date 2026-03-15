import type { ISiteRepository, SiteStats } from "@/core/domain/repositories";
import type { SiteEntity, SiteWithSupervision } from "@/core/domain/entities";
import type { SiteReference, Site } from "@/types";
import { MOCK_SITES } from "@/data/mock-sites";
import fs from "fs";
import path from "path";

function loadReferenceData(): SiteReference[] {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "sites-reference.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return data.sites ?? [];
  } catch (e) {
    console.error("[InMemorySiteRepo] Failed to load reference data:", e);
    return [];
  }
}

function refToEntity(ref: SiteReference): SiteEntity {
  return {
    id: ref.id,
    name: ref.name,
    aliases: ref.aliases,
    address: ref.address,
    postalCode: ref.postalCode,
    city: ref.city,
    lat: ref.lat,
    lng: ref.lng,
    addressStatus: ref.addressStatus,
    ltNames: ref.ltNames,
    ltCount: ref.ltCount ?? ref.ltNames.length,
    telephonyEquipment: ref.telephonyEquipment,
    likelyManagedByDSI: ref.likelyManagedByDSI,
    category: ref.category,
    zabbixStatus: ref.zabbixStatus,
    sensorsStatus: ref.sensorsStatus,
    zabbixEnabled: ref.zabbixEnabled,
    zabbixHostId: ref.zabbixHostId,
    visibleOnMap: ref.visibleOnMap,
    notes: ref.notes,
    blackboxInstalled: ref.blackboxInstalled,
    blackboxModel: ref.blackboxModel,
    blackboxSerial: ref.blackboxSerial,
    createdAt: ref.createdAt,
    updatedAt: ref.updatedAt,
  };
}

function mockToSupervision(mock: Site, ref?: SiteEntity): SiteWithSupervision {
  const base: SiteEntity = ref ?? {
    id: mock.id,
    name: mock.name,
    aliases: [],
    address: mock.address,
    postalCode: "94700",
    city: "Maisons-Alfort",
    lat: mock.coordinates[0],
    lng: mock.coordinates[1],
    addressStatus: "verified",
    ltNames: [],
    ltCount: 0,
    likelyManagedByDSI: true,
    zabbixStatus: "not_connected",
    sensorsStatus: "none",
    zabbixEnabled: false,
    visibleOnMap: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...base,
    status: mock.status,
    temperature: mock.temperature,
    humidity: mock.humidity,
    uptime: mock.uptime,
    powerConsumption: mock.powerConsumption,
    bayCount: mock.bayCount,
    alertCount: mock.alertCount,
    lastUpdate: mock.lastUpdate,
  };
}

export class InMemorySiteRepository implements ISiteRepository {
  private sites: Map<string, SiteEntity> = new Map();
  private overrides: Map<string, Partial<SiteEntity>> = new Map();
  private initialized = false;

  private init() {
    if (this.initialized) return;
    const refs = loadReferenceData();
    for (const ref of refs) {
      this.sites.set(ref.id, refToEntity(ref));
    }
    this.initialized = true;
  }

  async getAll(): Promise<SiteEntity[]> {
    this.init();
    return Array.from(this.sites.values()).map(s => {
      const ov = this.overrides.get(s.id);
      return ov ? { ...s, ...ov } : s;
    });
  }

  async getById(id: string): Promise<SiteEntity | null> {
    this.init();
    const site = this.sites.get(id);
    if (!site) return null;
    const ov = this.overrides.get(id);
    return ov ? { ...site, ...ov } : site;
  }

  async getSupervised(): Promise<SiteWithSupervision[]> {
    this.init();
    return MOCK_SITES.map(mock => {
      const ref = this.sites.get(mock.id);
      return mockToSupervision(mock, ref ?? undefined);
    });
  }

  async update(id: string, data: Partial<SiteEntity>): Promise<SiteEntity> {
    this.init();
    const existing = this.sites.get(id);
    if (!existing) throw new Error(`Site ${id} not found`);
    this.overrides.set(id, { ...this.overrides.get(id), ...data, updatedAt: new Date().toISOString() } as Partial<SiteEntity>);
    return { ...existing, ...this.overrides.get(id) } as SiteEntity;
  }

  async getStats(): Promise<SiteStats> {
    const all = await this.getAll();
    return {
      total: all.length,
      withCoordinates: all.filter(s => s.lat != null && s.lng != null).length,
      withoutCoordinates: all.filter(s => s.lat == null || s.lng == null).length,
      withLT: all.filter(s => s.ltCount > 0).length,
      connectedZabbix: all.filter(s => s.zabbixStatus === "connected" || s.zabbixStatus === "partial").length,
      dsiManaged: all.filter(s => s.likelyManagedByDSI).length,
      addressVerified: all.filter(s => s.addressStatus === "verified").length,
      blackboxInstalled: all.filter(s => s.blackboxInstalled).length,
      supervised: MOCK_SITES.length,
    };
  }
}
