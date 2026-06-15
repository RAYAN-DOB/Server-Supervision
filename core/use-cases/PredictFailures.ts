/**
 * PredictFailures.ts — Cas d'usage "maintenance prédictive" (couche use-cases).
 * Role dans AURION : à partir de l'historique des capteurs (Zabbix), anticiper les
 * dépassements de seuils (PredictFailures) et repérer les valeurs anormales (DetectAnomalies).
 * Reçoit : un site. Produit : des prévisions (date estimée, probabilité, conseil) et/ou
 * des anomalies. C'est ici qu'on calcule la TENDANCE (régression linéaire) et le z-score.
 */
import type { ISensorRepository } from "../domain/repositories";
import type { Prediction, AnomalyDetection, SensorReading } from "../domain/entities";
// Seuils de référence par type de capteur (valeurs critiques, sens du dépassement).
import { DEFAULT_THRESHOLDS } from "../domain/value-objects";

// Cas d'usage : prédire quels capteurs risquent d'atteindre leur seuil critique bientôt.
export class PredictFailures {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(siteId: string, siteName: string): Promise<Prediction[]> {
    // On part des relevés actuels du site ; sans capteur, rien à prédire.
    const sensors = await this.sensorRepo.getCurrentReadings(siteId);
    if (sensors.length === 0) return [];

    const predictions: Prediction[] = [];
    const now = new Date();
    // Fenêtre d'analyse : les 30 derniers jours (30 j * 24 h * 60 min * 60 s * 1000 ms).
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // On analyse chaque capteur indépendamment.
    for (const sensor of sensors) {
      try {
        // Historique journalier (agrégation "daily") sur 30 jours pour ce capteur.
        const history = await this.sensorRepo.getHistory(
          siteId, sensor.type, thirtyDaysAgo, now, "daily"
        );

        // Pas assez de points (< 3) : impossible de dégager une tendance fiable.
        if (history.readings.length < 3) continue;

        // Calcul de la pente (slope) via régression linéaire sur les valeurs.
        const trend = this.calculateTrend(history.readings.map(r => r.value));
        const threshold = DEFAULT_THRESHOLDS[sensor.type];
        if (!threshold) continue; // Type de capteur sans seuil défini -> on ignore.

        // On ne prédit une panne que si la courbe MONTE et que le seuil est un maximum.
        if (trend.slope > 0 && threshold.direction === "above") {
          // Estimation du nombre de jours avant d'atteindre le seuil critique :
          // (distance restante) / (vitesse de montée par jour).
          // "|| 0.01" évite une division par zéro si la pente est nulle.
          const daysToThreshold = threshold.critical > sensor.value
            ? (threshold.critical - sensor.value) / (trend.slope || 0.01)
            : 0;

          // On ne garde que les risques proches : entre 0 et 30 jours.
          if (daysToThreshold > 0 && daysToThreshold < 30) {
            const estimatedDate = new Date(now.getTime() + daysToThreshold * 24 * 60 * 60 * 1000);
            // Probabilité : plus l'échéance est proche, plus elle est élevée.
            // Bornée entre 0.1 et 0.95 pour rester réaliste.
            const probability = Math.min(0.95, Math.max(0.1, 1 - daysToThreshold / 30));

            // Construction de la prévision lisible par le front.
            predictions.push({
              id: `pred-${siteId}-${sensor.type}-${Date.now()}`,
              siteId,
              siteName,
              sensorType: sensor.type,
              currentValue: sensor.value,
              // Valeur projetée au moment estimé du dépassement.
              predictedValue: sensor.value + trend.slope * daysToThreshold,
              threshold: threshold.critical,
              // Arrondi à 2 décimales pour l'affichage.
              probability: Math.round(probability * 100) / 100,
              // Traduction de la probabilité en niveau de confiance lisible.
              confidence: probability > 0.7 ? "high" : probability > 0.4 ? "medium" : "low",
              estimatedDate: estimatedDate.toISOString(),
              // Sens de la tendance (hausse/baisse/stable) selon la pente.
              trend: trend.slope > 0.5 ? "rising" : trend.slope < -0.5 ? "falling" : "stable",
              // Conseil de maintenance adapté au type de capteur.
              recommendation: this.getRecommendation(sensor.type, trend.slope),
              createdAt: now.toISOString(),
            });
          }
        }
      } catch {
        // Historique indisponible pour ce capteur : on l'ignore sans bloquer les autres.
      }
    }

    // Tri décroissant : les risques les plus probables en premier.
    return predictions.sort((a, b) => b.probability - a.probability);
  }

  // Régression linéaire (méthode des moindres carrés) : calcule la PENTE de la
  // courbe (vitesse d'évolution par jour) et le R2 (qualité de l'ajustement, 0->1).
  // X = indice du jour (0,1,2...), Y = valeur mesurée du capteur.
  private calculateTrend(values: number[]): { slope: number; r2: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, r2: 0 }; // Une seule valeur : aucune tendance.

    // Sommes nécessaires aux formules : Σx, Σy, Σxy, Σx², Σy².
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
      sumY2 += values[i] * values[i];
    }

    // Pente de la droite de régression : slope = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²).
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    // ssRes = somme des carrés des écarts entre valeurs réelles et droite prédite.
    const ssRes = values.reduce((s, y, i) => {
      const predicted = (sumY / n) + slope * (i - sumX / n);
      return s + (y - predicted) ** 2;
    }, 0);
    // ssTot = somme des carrés des écarts à la moyenne (variance totale).
    const ssTot = values.reduce((s, y) => s + (y - sumY / n) ** 2, 0);
    // R2 = 1 - ssRes/ssTot : proche de 1 = la tendance explique bien les données.
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope, r2 };
  }

  // Renvoie un conseil de maintenance en français selon le type de capteur
  // (et l'intensité de la pente pour la température). Table associative.
  private getRecommendation(sensorType: string, slope: number): string {
    const recommendations: Record<string, string> = {
      temperature: slope > 1
        ? "Vérifier le système de climatisation et le flux d'air dans les baies"
        : "Surveiller l'évolution — planifier un contrôle préventif",
      humidity: "Vérifier le déshumidificateur et l'étanchéité de la salle",
      vibration: "Inspecter les fixations des équipements et le sol technique",
      airflow: "Nettoyer les filtres et vérifier les ventilateurs",
      pressure: "Vérifier l'étanchéité de la salle et la surpression",
    };
    // "?? ..." : conseil générique si le type de capteur n'est pas dans la table.
    return recommendations[sensorType] ?? "Planifier une inspection préventive";
  }
}

// Cas d'usage : détecter les valeurs ANORMALES (statistiquement aberrantes) via le z-score.
export class DetectAnomalies {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(siteId: string): Promise<AnomalyDetection[]> {
    const sensors = await this.sensorRepo.getCurrentReadings(siteId);
    const anomalies: AnomalyDetection[] = [];
    const now = new Date();
    // Fenêtre de référence : les 7 derniers jours (comportement "normal" récent).
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const sensor of sensors) {
      try {
        // Historique horaire sur 7 jours pour établir la "normale" de ce capteur.
        const history = await this.sensorRepo.getHistory(siteId, sensor.type, sevenDaysAgo, now, "hourly");
        if (history.readings.length < 10) continue; // Trop peu de points -> non fiable.

        // Statistiques de base : moyenne et écart-type des valeurs historiques.
        const values = history.readings.map(r => r.value);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);

        // z-score = de combien d'écarts-types la valeur actuelle s'éloigne de la moyenne.
        const deviation = Math.abs(sensor.value - mean);
        const zScore = stdDev > 0 ? deviation / stdDev : 0;

        // Au-delà de 2 écarts-types, la valeur est considérée comme anormale.
        if (zScore > 2) {
          anomalies.push({
            siteId,
            sensorType: sensor.type,
            detectedAt: now.toISOString(),
            currentValue: sensor.value,
            // Plage "attendue" = moyenne ± 2 écarts-types (arrondie à 1 décimale).
            expectedRange: {
              min: Math.round((mean - 2 * stdDev) * 10) / 10,
              max: Math.round((mean + 2 * stdDev) * 10) / 10,
            },
            deviation: Math.round(zScore * 100) / 100,
            // Sévérité graduée selon l'ampleur de l'écart (z-score).
            severity: zScore > 3 ? "high" : zScore > 2.5 ? "medium" : "low",
          });
        }
      } catch {
        // Historique indisponible : on ignore ce capteur.
      }
    }

    return anomalies;
  }
}
