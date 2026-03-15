import type { SensorReading, SensorHistory, BayEntity } from "../entities";

export interface ISensorRepository {
  getCurrentReadings(siteId: string): Promise<SensorReading[]>;
  getHistory(siteId: string, sensorType: string, from: Date, to: Date, aggregation?: "raw" | "hourly" | "daily"): Promise<SensorHistory>;
  getBaysForSite(siteId: string): Promise<BayEntity[]>;
  getLatestReading(siteId: string, sensorType: string): Promise<SensorReading | null>;
}
