import type { ISensorRepository } from "../domain/repositories";
import type { Prediction, AnomalyDetection, SensorReading } from "../domain/entities";
import { DEFAULT_THRESHOLDS } from "../domain/value-objects";

export class PredictFailures {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(siteId: string, siteName: string): Promise<Prediction[]> {
    const sensors = await this.sensorRepo.getCurrentReadings(siteId);
    if (sensors.length === 0) return [];

    const predictions: Prediction[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const sensor of sensors) {
      try {
        const history = await this.sensorRepo.getHistory(
          siteId, sensor.type, thirtyDaysAgo, now, "daily"
        );

        if (history.readings.length < 3) continue;

        const trend = this.calculateTrend(history.readings.map(r => r.value));
        const threshold = DEFAULT_THRESHOLDS[sensor.type];
        if (!threshold) continue;

        if (trend.slope > 0 && threshold.direction === "above") {
          const daysToThreshold = threshold.critical > sensor.value
            ? (threshold.critical - sensor.value) / (trend.slope || 0.01)
            : 0;

          if (daysToThreshold > 0 && daysToThreshold < 30) {
            const estimatedDate = new Date(now.getTime() + daysToThreshold * 24 * 60 * 60 * 1000);
            const probability = Math.min(0.95, Math.max(0.1, 1 - daysToThreshold / 30));

            predictions.push({
              id: `pred-${siteId}-${sensor.type}-${Date.now()}`,
              siteId,
              siteName,
              sensorType: sensor.type,
              currentValue: sensor.value,
              predictedValue: sensor.value + trend.slope * daysToThreshold,
              threshold: threshold.critical,
              probability: Math.round(probability * 100) / 100,
              confidence: probability > 0.7 ? "high" : probability > 0.4 ? "medium" : "low",
              estimatedDate: estimatedDate.toISOString(),
              trend: trend.slope > 0.5 ? "rising" : trend.slope < -0.5 ? "falling" : "stable",
              recommendation: this.getRecommendation(sensor.type, trend.slope),
              createdAt: now.toISOString(),
            });
          }
        }
      } catch {
        // Sensor history unavailable, skip
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  private calculateTrend(values: number[]): { slope: number; r2: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
      sumY2 += values[i] * values[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const ssRes = values.reduce((s, y, i) => {
      const predicted = (sumY / n) + slope * (i - sumX / n);
      return s + (y - predicted) ** 2;
    }, 0);
    const ssTot = values.reduce((s, y) => s + (y - sumY / n) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope, r2 };
  }

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
    return recommendations[sensorType] ?? "Planifier une inspection préventive";
  }
}

export class DetectAnomalies {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(siteId: string): Promise<AnomalyDetection[]> {
    const sensors = await this.sensorRepo.getCurrentReadings(siteId);
    const anomalies: AnomalyDetection[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const sensor of sensors) {
      try {
        const history = await this.sensorRepo.getHistory(siteId, sensor.type, sevenDaysAgo, now, "hourly");
        if (history.readings.length < 10) continue;

        const values = history.readings.map(r => r.value);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);

        const deviation = Math.abs(sensor.value - mean);
        const zScore = stdDev > 0 ? deviation / stdDev : 0;

        if (zScore > 2) {
          anomalies.push({
            siteId,
            sensorType: sensor.type,
            detectedAt: now.toISOString(),
            currentValue: sensor.value,
            expectedRange: {
              min: Math.round((mean - 2 * stdDev) * 10) / 10,
              max: Math.round((mean + 2 * stdDev) * 10) / 10,
            },
            deviation: Math.round(zScore * 100) / 100,
            severity: zScore > 3 ? "high" : zScore > 2.5 ? "medium" : "low",
          });
        }
      } catch {
        // Skip
      }
    }

    return anomalies;
  }
}
