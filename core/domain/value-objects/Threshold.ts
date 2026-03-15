export interface ThresholdConfig {
  warning: number;
  critical: number;
  direction: "above" | "below" | "both";
}

export class Threshold {
  constructor(private config: ThresholdConfig) {}

  evaluate(value: number): "normal" | "warning" | "critical" {
    const { warning, critical, direction } = this.config;
    if (direction === "above") {
      if (value >= critical) return "critical";
      if (value >= warning) return "warning";
      return "normal";
    }
    if (direction === "below") {
      if (value <= critical) return "critical";
      if (value <= warning) return "warning";
      return "normal";
    }
    // both
    if (value >= critical || value <= -critical) return "critical";
    if (value >= warning || value <= -warning) return "warning";
    return "normal";
  }
}

export const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  temperature: { warning: 28, critical: 35, direction: "above" },
  humidity: { warning: 65, critical: 80, direction: "above" },
  vibration: { warning: 0.3, critical: 0.5, direction: "above" },
  airflow: { warning: 80, critical: 60, direction: "below" },
  pressure: { warning: 1005, critical: 1000, direction: "below" },
};
