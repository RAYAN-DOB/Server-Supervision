import type { ISiteRepository, SiteStats } from "../domain/repositories";
import type { ISensorRepository } from "../domain/repositories";
import type { IAlertRepository } from "../domain/repositories";
import type { SiteEntity, SiteWithSupervision, SensorReading, AlertEntity, BayEntity } from "../domain/entities";

export interface SiteDetailData {
  site: SiteEntity;
  sensors: SensorReading[];
  bays: BayEntity[];
  alerts: AlertEntity[];
  supervision: SiteWithSupervision | null;
}

export class GetSiteData {
  constructor(
    private siteRepo: ISiteRepository,
    private sensorRepo: ISensorRepository,
    private alertRepo: IAlertRepository
  ) {}

  async execute(siteId: string): Promise<SiteDetailData | null> {
    const site = await this.siteRepo.getById(siteId);
    if (!site) return null;

    const [sensors, bays, alerts, supervised] = await Promise.all([
      this.sensorRepo.getCurrentReadings(siteId).catch(() => [] as SensorReading[]),
      this.sensorRepo.getBaysForSite(siteId).catch(() => [] as BayEntity[]),
      this.alertRepo.getBySite(siteId).catch(() => [] as AlertEntity[]),
      this.siteRepo.getSupervised().then(s => s.find(x => x.id === siteId) ?? null).catch(() => null),
    ]);

    return { site, sensors, bays, alerts, supervision: supervised };
  }
}

export class GetAllSites {
  constructor(private siteRepo: ISiteRepository) {}

  async execute(): Promise<SiteEntity[]> {
    return this.siteRepo.getAll();
  }
}

export class GetSiteStats {
  constructor(private siteRepo: ISiteRepository) {}

  async execute(): Promise<SiteStats> {
    return this.siteRepo.getStats();
  }
}
