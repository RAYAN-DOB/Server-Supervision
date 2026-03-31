import type { ISensorRepository } from "@/core/domain/repositories";
import type { SensorReading, SensorHistory, BayEntity, SensorType, SensorStatus } from "@/core/domain/entities";
import { generateSensors, generateBaysForSite, MOCK_SITES } from "@/data/mocks";
import type { Sensors, SensorReading as LegacySensorReading, BinarySensor } from "@/types";

function mapSensorStatus(status: string): SensorStatus {
  if (status === "critical") return "critical";
  if (status === "warning") return "warning";
  return "normal";
}

function sensorsToReadings(siteId: string, bayId: string, sensors: Sensors): SensorReading[] {
  const now = new Date().toISOString();
  const readings: SensorReading[] = [];

  const addReading = (type: SensorType, reading: LegacySensorReading) => {
    readings.push({
      id: `${siteId}-${bayId}-${type}`,
      siteId,
      bayId,
      type,
      value: Math.round(reading.value * 100) / 100,
      unit: reading.unit,
      status: mapSensorStatus(reading.status),
      threshold: reading.threshold,
      timestamp: reading.lastUpdate || now,
    });
  };

  const addBinary = (type: SensorType, sensor: BinarySensor) => {
    readings.push({
      id: `${siteId}-${bayId}-${type}`,
      siteId,
      bayId,
      type,
      value: sensor.active ? 1 : 0,
      unit: "bool",
      status: mapSensorStatus(sensor.status),
      threshold: { warning: 1, critical: 1 },
      timestamp: sensor.lastUpdate || now,
    });
  };

  addReading("temperature", sensors.temperature);
  addReading("humidity", sensors.humidity);
  addBinary("smoke", sensors.smoke);
  addBinary("water", sensors.water);
  addBinary("door", sensors.door);
  addReading("vibration", sensors.vibration);
  addBinary("power", sensors.power230v);
  addReading("airflow", sensors.airflow);
  addReading("pressure", sensors.pressure);

  return readings;
}

function generateHistoricalData(baseValue: number, days: number, hourly: boolean): Array<{ value: number; timestamp: string }> {
  const now = Date.now();
  const interval = hourly ? 3600000 : 86400000;
  const count = hourly ? days * 24 : days;
  const data: Array<{ value: number; timestamp: string }> = [];

  for (let i = count; i >= 0; i--) {
    const t = now - i * interval;
    const dayOfYear = Math.floor(t / 86400000);
    const hourOfDay = new Date(t).getHours();
    const seasonal = Math.sin((dayOfYear / 365) * Math.PI * 2) * 2;
    const daily = Math.sin((hourOfDay / 24) * Math.PI * 2) * 1.5;
    const noise = (Math.random() - 0.5) * 0.8;
    data.push({
      value: Math.round((baseValue + seasonal + daily + noise) * 100) / 100,
      timestamp: new Date(t).toISOString(),
    });
  }
  return data;
}

export class InMemorySensorRepository implements ISensorRepository {
  async getCurrentReadings(siteId: string): Promise<SensorReading[]> {
    const mock = MOCK_SITES.find(s => s.id === siteId);
    if (!mock) return [];

    const bays = generateBaysForSite(siteId, mock.name, mock.bayCount);
    const allReadings: SensorReading[] = [];
    for (const bay of bays) {
      allReadings.push(...sensorsToReadings(siteId, bay.id, bay.sensors));
    }
    return allReadings;
  }

  async getHistory(
    siteId: string,
    sensorType: string,
    from: Date,
    to: Date,
    aggregation: "raw" | "hourly" | "daily" = "hourly"
  ): Promise<SensorHistory> {
    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000);
    const baseValues: Record<string, number> = {
      temperature: 22.5,
      humidity: 45,
      vibration: 0.15,
      airflow: 120,
      pressure: 1013,
    };

    const baseValue = baseValues[sensorType] ?? 50;
    const readings = generateHistoricalData(baseValue, days, aggregation === "hourly" || aggregation === "raw");

    return {
      siteId,
      type: sensorType as SensorType,
      readings: readings.filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= from.getTime() && t <= to.getTime();
      }),
      period: { from: from.toISOString(), to: to.toISOString() },
      aggregation,
    };
  }

  async getBaysForSite(siteId: string): Promise<BayEntity[]> {
    const mock = MOCK_SITES.find(s => s.id === siteId);
    if (!mock) return [];

    const legacyBays = generateBaysForSite(siteId, mock.name, mock.bayCount);
    return legacyBays.map(bay => ({
      id: bay.id,
      siteId: bay.siteId,
      name: bay.name,
      location: bay.location,
      status: mapSensorStatus(bay.status),
      sensors: sensorsToReadings(siteId, bay.id, bay.sensors),
      lastUpdate: bay.lastUpdate,
      powerConsumption: bay.powerConsumption,
    }));
  }

  async getLatestReading(siteId: string, sensorType: string): Promise<SensorReading | null> {
    const all = await this.getCurrentReadings(siteId);
    return all.find(s => s.type === sensorType) ?? null;
  }
}
