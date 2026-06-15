/**
 * GetSensorHistory.ts — Cas d'usage "historique d'un capteur" (couche use-cases).
 * Role dans AURION : récupérer l'évolution d'une grandeur (température, humidité...)
 * d'un site sur une plage de dates, pour tracer les courbes/graphiques.
 * Reçoit : siteId, type de capteur, date début, date fin, et le niveau d'agrégation.
 * Produit : un SensorHistory (série de relevés). Les données viennent de Zabbix.
 */
import type { ISensorRepository } from "../domain/repositories";
import type { SensorHistory } from "../domain/entities";

export class GetSensorHistory {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(
    siteId: string,
    sensorType: string,
    fromDate: Date,
    toDate: Date,
    // Agrégation : "raw" = points bruts, "hourly"/"daily" = moyennes par heure/jour.
    // Par défaut "hourly" : bon compromis entre précision et volume de données.
    aggregation: "raw" | "hourly" | "daily" = "hourly"
  ): Promise<SensorHistory> {
    // Délègue simplement la requête au repository (qui interroge Zabbix).
    return this.sensorRepo.getHistory(siteId, sensorType, fromDate, toDate, aggregation);
  }
}
