export type PredictionConfidence = "low" | "medium" | "high";

export interface Prediction {
  id: string;
  siteId: string;
  siteName: string;
  sensorType: string;
  currentValue: number;
  predictedValue: number;
  threshold: number;
  probability: number;
  confidence: PredictionConfidence;
  estimatedDate: string;
  trend: "rising" | "falling" | "stable";
  recommendation: string;
  createdAt: string;
}

export interface AnomalyDetection {
  siteId: string;
  sensorType: string;
  detectedAt: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
  deviation: number;
  severity: "low" | "medium" | "high";
}
