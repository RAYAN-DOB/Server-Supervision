import { prisma } from "@/lib/prisma";
import type { ISensorRepository } from "@/core/domain/repositories";
import type { SensorReading, SensorHistory, SensorType, SensorStatus, BayEntity } from "@/core/domain/entities";
import type { SensorReading as PrismaSensor, Bay as PrismaBay } from "@prisma/client";

function toReading(row: PrismaSensor): SensorReading {
  return {
    id: row.id,
    siteId: row.siteId,
    bayId: row.bayId ?? undefined,
    type: row.type as SensorType,
    value: row.value,
    unit: row.unit,
    status: row.status as SensorStatus,
    threshold: { warning: row.thresholdWarn, critical: row.thresholdCrit },
    timestamp: row.timestamp.toISOString(),
  };
}

export class PrismaSensorRepository implements ISensorRepository {
  async getCurrentReadings(siteId: string): Promise<SensorReading[]> {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000);

    const rows = await prisma.sensorReading.findMany({
      where: { siteId, timestamp: { gte: fiveMinAgo } },
      orderBy: { timestamp: "desc" },
    });

    if (rows.length === 0) {
      const types = ["temperature", "humidity", "smoke", "water", "door", "vibration", "power", "airflow", "pressure"];
      const latest: PrismaSensor[] = [];
      for (const type of types) {
        const row = await prisma.sensorReading.findFirst({
          where: { siteId, type },
          orderBy: { timestamp: "desc" },
        });
        if (row) latest.push(row);
      }
      return latest.map(toReading);
    }

    return rows.map(toReading);
  }

  async getHistory(
    siteId: string,
    sensorType: string,
    from: Date,
    to: Date,
    aggregation: "raw" | "hourly" | "daily" = "hourly"
  ): Promise<SensorHistory> {
    const rows = await prisma.sensorReading.findMany({
      where: {
        siteId,
        type: sensorType,
        timestamp: { gte: from, lte: to },
      },
      orderBy: { timestamp: "asc" },
      select: { value: true, timestamp: true },
    });

    let readings = rows.map((r) => ({
      value: r.value,
      timestamp: r.timestamp.toISOString(),
    }));

    if (aggregation !== "raw" && readings.length > 0) {
      readings = this.aggregate(readings, aggregation);
    }

    return {
      siteId,
      type: sensorType as SensorType,
      readings,
      period: { from: from.toISOString(), to: to.toISOString() },
      aggregation,
    };
  }

  async getBaysForSite(siteId: string): Promise<BayEntity[]> {
    const rows = await prisma.bay.findMany({
      where: { siteId },
      include: {
        sensors: {
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    });

    return rows.map((bay) => ({
      id: bay.id,
      siteId: bay.siteId,
      name: bay.name,
      location: bay.location ?? "",
      status: bay.status as SensorStatus,
      sensors: bay.sensors.map(toReading),
      lastUpdate: bay.lastUpdate.toISOString(),
      powerConsumption: bay.powerConsumption,
    }));
  }

  async getLatestReading(siteId: string, sensorType: string): Promise<SensorReading | null> {
    const row = await prisma.sensorReading.findFirst({
      where: { siteId, type: sensorType },
      orderBy: { timestamp: "desc" },
    });
    return row ? toReading(row) : null;
  }

  private aggregate(
    readings: Array<{ value: number; timestamp: string }>,
    mode: "hourly" | "daily"
  ): Array<{ value: number; timestamp: string }> {
    const buckets = new Map<string, number[]>();

    for (const r of readings) {
      const d = new Date(r.timestamp);
      const key = mode === "hourly"
        ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`
        : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = buckets.get(key) ?? [];
      arr.push(r.value);
      buckets.set(key, arr);
    }

    const result: Array<{ value: number; timestamp: string }> = [];
    for (const [, values] of buckets) {
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      result.push({
        value: Math.round(avg * 100) / 100,
        timestamp: readings.find((r) => {
          const vals = buckets.get(
            mode === "hourly"
              ? `${new Date(r.timestamp).getFullYear()}-${new Date(r.timestamp).getMonth()}-${new Date(r.timestamp).getDate()}-${new Date(r.timestamp).getHours()}`
              : `${new Date(r.timestamp).getFullYear()}-${new Date(r.timestamp).getMonth()}-${new Date(r.timestamp).getDate()}`
          );
          return vals?.includes(r.value);
        })?.timestamp ?? new Date().toISOString(),
      });
    }

    return result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}
