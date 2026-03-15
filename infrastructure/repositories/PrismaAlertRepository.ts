import { prisma } from "@/lib/prisma";
import type { IAlertRepository } from "@/core/domain/repositories";
import type { AlertEntity, AlertStatus } from "@/core/domain/entities";
import type { Alert as PrismaAlert } from "@prisma/client";

function toEntity(row: PrismaAlert): AlertEntity {
  return {
    id: row.id,
    siteId: row.siteId,
    siteName: row.siteName,
    bayId: row.bayId ?? undefined,
    bayName: row.bayName ?? undefined,
    severity: row.severity as AlertEntity["severity"],
    title: row.title,
    description: row.description,
    timestamp: row.createdAt.toISOString(),
    status: row.status as AlertStatus,
    acknowledgedBy: row.acknowledgedBy ?? undefined,
    acknowledgedAt: row.acknowledgedAt?.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString(),
    sensorType: row.sensorType ?? undefined,
    value: row.value ?? undefined,
    threshold: row.threshold ?? undefined,
    source: row.source as AlertEntity["source"],
  };
}

export class PrismaAlertRepository implements IAlertRepository {
  async getAll(): Promise<AlertEntity[]> {
    const rows = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toEntity);
  }

  async getActive(): Promise<AlertEntity[]> {
    const rows = await prisma.alert.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntity);
  }

  async getBySite(siteId: string): Promise<AlertEntity[]> {
    const rows = await prisma.alert.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntity);
  }

  async getById(id: string): Promise<AlertEntity | null> {
    const row = await prisma.alert.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async acknowledge(id: string, userName: string): Promise<AlertEntity> {
    const row = await prisma.alert.update({
      where: { id },
      data: {
        status: "acknowledged",
        acknowledgedBy: userName,
        acknowledgedAt: new Date(),
      },
    });
    return toEntity(row);
  }

  async resolve(id: string): Promise<AlertEntity> {
    const row = await prisma.alert.update({
      where: { id },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    });
    return toEntity(row);
  }

  async create(data: Omit<AlertEntity, "id">): Promise<AlertEntity> {
    const row = await prisma.alert.create({
      data: {
        siteId: data.siteId,
        siteName: data.siteName,
        bayId: data.bayId,
        bayName: data.bayName,
        severity: data.severity,
        title: data.title,
        description: data.description,
        status: data.status,
        source: data.source,
        sensorType: data.sensorType,
        value: data.value,
        threshold: data.threshold,
        acknowledgedBy: data.acknowledgedBy,
        acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt) : undefined,
        resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : undefined,
        createdAt: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });
    return toEntity(row);
  }

  async getCountByStatus(): Promise<Record<AlertStatus, number>> {
    const results = await prisma.alert.groupBy({
      by: ["status"],
      _count: true,
    });

    const counts: Record<AlertStatus, number> = { active: 0, acknowledged: 0, resolved: 0 };
    for (const r of results) {
      counts[r.status as AlertStatus] = r._count;
    }
    return counts;
  }
}
