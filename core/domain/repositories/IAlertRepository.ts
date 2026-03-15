import type { AlertEntity, AlertStatus } from "../entities";

export interface IAlertRepository {
  getAll(): Promise<AlertEntity[]>;
  getActive(): Promise<AlertEntity[]>;
  getBySite(siteId: string): Promise<AlertEntity[]>;
  getById(id: string): Promise<AlertEntity | null>;
  acknowledge(id: string, userName: string): Promise<AlertEntity>;
  resolve(id: string): Promise<AlertEntity>;
  create(alert: Omit<AlertEntity, "id">): Promise<AlertEntity>;
  getCountByStatus(): Promise<Record<AlertStatus, number>>;
}
