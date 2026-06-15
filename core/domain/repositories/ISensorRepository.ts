/**
 * ISensorRepository.ts — Contrat (interface) d'accès aux CAPTEURS (couche domain).
 * Role dans AURION : définit comment lire les mesures d'environnement (température,
 * humidité...) et les baies, sans préciser l'implémentation (qui interroge Zabbix).
 * Utilisé par les use-cases GetSiteData, GetSensorHistory, PredictFailures, DetectAnomalies.
 */
import type { SensorReading, SensorHistory, BayEntity } from "../entities";

export interface ISensorRepository {
  // Dernières valeurs en temps réel de tous les capteurs d'un site.
  getCurrentReadings(siteId: string): Promise<SensorReading[]>;
  // Série historique d'un capteur sur une plage de dates, avec niveau d'agrégation.
  getHistory(siteId: string, sensorType: string, from: Date, to: Date, aggregation?: "raw" | "hourly" | "daily"): Promise<SensorHistory>;
  // Baies (armoires) présentes dans le site.
  getBaysForSite(siteId: string): Promise<BayEntity[]>;
  // Dernière mesure d'un type de capteur précis (ou null si aucune).
  getLatestReading(siteId: string, sensorType: string): Promise<SensorReading | null>;
}
