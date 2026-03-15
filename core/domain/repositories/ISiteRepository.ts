import type { SiteEntity, SiteWithSupervision } from "../entities";

export interface ISiteRepository {
  getAll(): Promise<SiteEntity[]>;
  getById(id: string): Promise<SiteEntity | null>;
  getSupervised(): Promise<SiteWithSupervision[]>;
  update(id: string, data: Partial<SiteEntity>): Promise<SiteEntity>;
  getStats(): Promise<SiteStats>;
}

export interface SiteStats {
  total: number;
  withCoordinates: number;
  withoutCoordinates: number;
  withLT: number;
  connectedZabbix: number;
  dsiManaged: number;
  addressVerified: number;
  blackboxInstalled: number;
  supervised: number;
}
