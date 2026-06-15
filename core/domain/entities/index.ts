// ============================================================================
// index.ts (entities) — Point d'entree unique des entites du domaine AURION
// ----------------------------------------------------------------------------
// Role : re-exporter toutes les entites/types du dossier pour pouvoir ecrire
//        un seul import (ex : import { AlertEntity } from "core/domain/entities").
// Cela centralise les exports et evite des chemins d'import a rallonge ailleurs.
// ============================================================================
export type { SiteEntity, SiteWithSupervision } from "./SiteEntity";
export type { SensorReading, SensorHistory, SensorType, SensorStatus, BayEntity } from "./SensorEntity";
export type { AlertEntity, AlertSeverity, AlertStatus } from "./AlertEntity";
export { alertStatusFromLegacy, isAlertActive, isAlertCritical } from "./AlertEntity";
export type { Prediction, AnomalyDetection, PredictionConfidence } from "./PredictionEntity";
