import { prisma } from "@/lib/prisma";
import type { ISiteRepository, SiteStats } from "@/core/domain/repositories";
import type { SiteEntity, SiteWithSupervision } from "@/core/domain/entities";
import type { Site as PrismaSite } from "@prisma/client";

function toEntity(row: PrismaSite): SiteEntity {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases ? JSON.parse(row.aliases) : undefined,
    address: row.address,
    postalCode: row.postalCode,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    addressStatus: row.addressStatus as SiteEntity["addressStatus"],
    ltNames: row.ltNames ? JSON.parse(row.ltNames) : [],
    ltCount: row.ltCount,
    telephonyEquipment: row.telephonyEquipment,
    likelyManagedByDSI: row.likelyManagedByDSI,
    category: row.category as SiteEntity["category"],
    zabbixStatus: row.zabbixStatus as SiteEntity["zabbixStatus"],
    sensorsStatus: row.sensorsStatus as SiteEntity["sensorsStatus"],
    zabbixEnabled: row.zabbixEnabled,
    zabbixHostId: row.zabbixHostId,
    visibleOnMap: row.visibleOnMap,
    notes: row.notes,
    blackboxInstalled: row.blackboxInstalled,
    blackboxModel: row.blackboxModel,
    blackboxSerial: row.blackboxSerial,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaSiteRepository implements ISiteRepository {
  async getAll(): Promise<SiteEntity[]> {
    const rows = await prisma.site.findMany({ orderBy: { name: "asc" } });
    return rows.map(toEntity);
  }

  async getById(id: string): Promise<SiteEntity | null> {
    const row = await prisma.site.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async getSupervised(): Promise<SiteWithSupervision[]> {
    const rows = await prisma.site.findMany({
      where: { blackboxInstalled: true },
      include: {
        bays: true,
        alerts: { where: { status: "active" } },
        sensors: {
          where: { timestamp: { gte: new Date(Date.now() - 5 * 60_000) } },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    return rows.map((row) => {
      const tempReadings = row.sensors.filter((s) => s.type === "temperature");
      const humReadings = row.sensors.filter((s) => s.type === "humidity");
      const avgTemp = tempReadings.length > 0
        ? tempReadings.reduce((s, r) => s + r.value, 0) / tempReadings.length
        : 22;
      const avgHum = humReadings.length > 0
        ? humReadings.reduce((s, r) => s + r.value, 0) / humReadings.length
        : 45;

      const base = toEntity(row);
      return {
        ...base,
        status: row.alerts.some((a) => a.severity === "critical")
          ? "critical" as const
          : row.alerts.length > 0
          ? "warning" as const
          : "ok" as const,
        temperature: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(avgHum * 10) / 10,
        uptime: 99.5,
        powerConsumption: row.bays.reduce((s, b) => s + b.powerConsumption, 0),
        bayCount: row.bays.length,
        alertCount: row.alerts.length,
        lastUpdate: row.sensors[0]?.timestamp.toISOString() ?? new Date().toISOString(),
      };
    });
  }

  async update(id: string, data: Partial<SiteEntity>): Promise<SiteEntity> {
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === "aliases" || key === "ltNames") {
        updateData[key] = JSON.stringify(value);
      } else if (key !== "createdAt" && key !== "updatedAt") {
        updateData[key] = value;
      }
    }

    const row = await prisma.site.update({
      where: { id },
      data: updateData,
    });
    return toEntity(row);
  }

  async getStats(): Promise<SiteStats> {
    const [
      total,
      withCoords,
      withLT,
      connectedZabbix,
      dsiManaged,
      addressVerified,
      blackbox,
      supervised,
    ] = await Promise.all([
      prisma.site.count(),
      prisma.site.count({ where: { lat: { not: null }, lng: { not: null } } }),
      prisma.site.count({ where: { ltCount: { gt: 0 } } }),
      prisma.site.count({ where: { zabbixStatus: { in: ["connected", "partial"] } } }),
      prisma.site.count({ where: { likelyManagedByDSI: true } }),
      prisma.site.count({ where: { addressStatus: "verified" } }),
      prisma.site.count({ where: { blackboxInstalled: true } }),
      prisma.site.count({ where: { OR: [{ blackboxInstalled: true }, { zabbixEnabled: true }] } }),
    ]);

    return {
      total,
      withCoordinates: withCoords,
      withoutCoordinates: total - withCoords,
      withLT,
      connectedZabbix,
      dsiManaged,
      addressVerified,
      blackboxInstalled: blackbox,
      supervised,
    };
  }
}
