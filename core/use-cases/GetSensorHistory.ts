import type { ISensorRepository } from "../domain/repositories";
import type { SensorHistory } from "../domain/entities";

export class GetSensorHistory {
  constructor(private sensorRepo: ISensorRepository) {}

  async execute(
    siteId: string,
    sensorType: string,
    fromDate: Date,
    toDate: Date,
    aggregation: "raw" | "hourly" | "daily" = "hourly"
  ): Promise<SensorHistory> {
    return this.sensorRepo.getHistory(siteId, sensorType, fromDate, toDate, aggregation);
  }
}
