/**
 * index.ts (use-cases) — Point d'entrée unique de la couche "cas d'usage".
 * Role dans AURION : "barrel file" qui ré-exporte tous les use-cases pour que le
 * reste de l'app les importe depuis "core/use-cases" sans connaitre chaque fichier.
 * Ne contient aucune logique : uniquement des ré-exports (regroupement pratique).
 */
export { GetSiteData, GetAllSites, GetSiteStats } from "./GetSiteData";
export type { SiteDetailData } from "./GetSiteData";
export { AcknowledgeAlert, ResolveAlert, GetActiveAlerts, GetAlertStats } from "./ManageAlerts";
export { GetSensorHistory } from "./GetSensorHistory";
export { PredictFailures, DetectAnomalies } from "./PredictFailures";
