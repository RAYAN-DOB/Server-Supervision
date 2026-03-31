import type { IAlertRepository } from "@/core/domain/repositories";
import type { AlertEntity, AlertStatus } from "@/core/domain/entities";
import { alertStatusFromLegacy } from "@/core/domain/entities";
import { MOCK_ALERTS } from "@/data/mocks";
import type { Alert } from "@/types";

function legacyToEntity(alert: Alert): AlertEntity {
  return {
    id: alert.id,
    siteId: alert.siteId,
    siteName: alert.siteName,
    bayId: alert.bayId,
    bayName: alert.bayName,
    severity: alert.severity,
    title: alert.title,
    description: alert.description,
    timestamp: alert.timestamp,
    status: alertStatusFromLegacy(alert.acknowledged, alert.resolved),
    acknowledgedBy: alert.acknowledgedBy,
    acknowledgedAt: alert.acknowledgedAt,
    resolvedAt: alert.resolvedAt,
    sensorType: alert.sensorType,
    value: alert.value,
    threshold: alert.threshold,
    source: "blackbox",
  };
}

export class InMemoryAlertRepository implements IAlertRepository {
  private alerts: Map<string, AlertEntity> = new Map();
  private initialized = false;

  private init() {
    if (this.initialized) return;
    for (const a of MOCK_ALERTS) {
      const entity = legacyToEntity(a);
      this.alerts.set(entity.id, entity);
    }
    this.initialized = true;
  }

  async getAll(): Promise<AlertEntity[]> {
    this.init();
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getActive(): Promise<AlertEntity[]> {
    return (await this.getAll()).filter(a => a.status === "active");
  }

  async getBySite(siteId: string): Promise<AlertEntity[]> {
    return (await this.getAll()).filter(a => a.siteId === siteId);
  }

  async getById(id: string): Promise<AlertEntity | null> {
    this.init();
    return this.alerts.get(id) ?? null;
  }

  async acknowledge(id: string, userName: string): Promise<AlertEntity> {
    this.init();
    const alert = this.alerts.get(id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    const updated: AlertEntity = {
      ...alert,
      status: "acknowledged",
      acknowledgedBy: userName,
      acknowledgedAt: new Date().toISOString(),
    };
    this.alerts.set(id, updated);
    return updated;
  }

  async resolve(id: string): Promise<AlertEntity> {
    this.init();
    const alert = this.alerts.get(id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    const updated: AlertEntity = {
      ...alert,
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    };
    this.alerts.set(id, updated);
    return updated;
  }

  async create(data: Omit<AlertEntity, "id">): Promise<AlertEntity> {
    this.init();
    const alert: AlertEntity = {
      ...data,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async getCountByStatus(): Promise<Record<AlertStatus, number>> {
    const all = await this.getAll();
    return {
      active: all.filter(a => a.status === "active").length,
      acknowledged: all.filter(a => a.status === "acknowledged").length,
      resolved: all.filter(a => a.status === "resolved").length,
    };
  }
}
