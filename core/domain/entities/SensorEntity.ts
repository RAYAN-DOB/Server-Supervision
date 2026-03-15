export type SensorType = "temperature" | "humidity" | "smoke" | "water" | "door" | "vibration" | "power" | "airflow" | "pressure";
export type SensorStatus = "normal" | "warning" | "critical" | "offline";

export interface SensorReading {
  id: string;
  siteId: string;
  bayId?: string;
  type: SensorType;
  value: number;
  unit: string;
  status: SensorStatus;
  threshold: { warning: number; critical: number };
  timestamp: string;
}

export interface SensorHistory {
  siteId: string;
  type: SensorType;
  readings: Array<{ value: number; timestamp: string }>;
  period: { from: string; to: string };
  aggregation: "raw" | "hourly" | "daily";
}

export interface BayEntity {
  id: string;
  siteId: string;
  name: string;
  location: string;
  status: SensorStatus;
  sensors: SensorReading[];
  lastUpdate: string;
  powerConsumption: number;
}
