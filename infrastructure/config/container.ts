import type { ISiteRepository, ISensorRepository, IAlertRepository } from "@/core/domain/repositories";
import { PrismaSiteRepository } from "../repositories/PrismaSiteRepository";
import { PrismaAlertRepository } from "../repositories/PrismaAlertRepository";
import { PrismaSensorRepository } from "../repositories/PrismaSensorRepository";
import { GetSiteData, GetAllSites, GetSiteStats } from "@/core/use-cases/GetSiteData";
import { AcknowledgeAlert, ResolveAlert, GetActiveAlerts, GetAlertStats } from "@/core/use-cases/ManageAlerts";
import { GetSensorHistory } from "@/core/use-cases/GetSensorHistory";
import { PredictFailures, DetectAnomalies } from "@/core/use-cases/PredictFailures";

let _siteRepo: ISiteRepository | null = null;
let _alertRepo: IAlertRepository | null = null;
let _sensorRepo: ISensorRepository | null = null;

export function getSiteRepository(): ISiteRepository {
  if (!_siteRepo) _siteRepo = new PrismaSiteRepository();
  return _siteRepo;
}

export function getAlertRepository(): IAlertRepository {
  if (!_alertRepo) _alertRepo = new PrismaAlertRepository();
  return _alertRepo;
}

export function getSensorRepository(): ISensorRepository {
  if (!_sensorRepo) _sensorRepo = new PrismaSensorRepository();
  return _sensorRepo;
}

export function getUseCases() {
  const siteRepo = getSiteRepository();
  const alertRepo = getAlertRepository();
  const sensorRepo = getSensorRepository();

  return {
    getSiteData: new GetSiteData(siteRepo, sensorRepo, alertRepo),
    getAllSites: new GetAllSites(siteRepo),
    getSiteStats: new GetSiteStats(siteRepo),
    acknowledgeAlert: new AcknowledgeAlert(alertRepo),
    resolveAlert: new ResolveAlert(alertRepo),
    getActiveAlerts: new GetActiveAlerts(alertRepo),
    getAlertStats: new GetAlertStats(alertRepo),
    getSensorHistory: new GetSensorHistory(sensorRepo),
    predictFailures: new PredictFailures(sensorRepo),
    detectAnomalies: new DetectAnomalies(sensorRepo),
  };
}
