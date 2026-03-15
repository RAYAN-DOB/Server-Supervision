import type { IAlertRepository } from "../domain/repositories";
import type { AlertEntity, AlertStatus } from "../domain/entities";

export class AcknowledgeAlert {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(alertId: string, userName: string): Promise<AlertEntity> {
    const alert = await this.alertRepo.getById(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    if (alert.status !== "active") throw new Error(`Alert ${alertId} is already ${alert.status}`);
    return this.alertRepo.acknowledge(alertId, userName);
  }
}

export class ResolveAlert {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(alertId: string): Promise<AlertEntity> {
    const alert = await this.alertRepo.getById(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    if (alert.status === "resolved") throw new Error(`Alert ${alertId} is already resolved`);
    return this.alertRepo.resolve(alertId);
  }
}

export class GetActiveAlerts {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(): Promise<AlertEntity[]> {
    return this.alertRepo.getActive();
  }
}

export class GetAlertStats {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(): Promise<{ total: number; active: number; acknowledged: number; resolved: number; critical: number }> {
    const [all, counts] = await Promise.all([
      this.alertRepo.getAll(),
      this.alertRepo.getCountByStatus(),
    ]);
    const critical = all.filter(a => a.severity === "critical" && a.status === "active").length;
    return {
      total: all.length,
      active: counts.active ?? 0,
      acknowledged: counts.acknowledged ?? 0,
      resolved: counts.resolved ?? 0,
      critical,
    };
  }
}
