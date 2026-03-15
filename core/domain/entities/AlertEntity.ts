export type AlertSeverity = "info" | "minor" | "major" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface AlertEntity {
  id: string;
  siteId: string;
  siteName: string;
  bayId?: string;
  bayName?: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  sensorType?: string;
  value?: number;
  threshold?: number;
  source: "blackbox" | "zabbix" | "manual" | "system";
}

export function alertStatusFromLegacy(acknowledged: boolean, resolved: boolean): AlertStatus {
  if (resolved) return "resolved";
  if (acknowledged) return "acknowledged";
  return "active";
}

export function isAlertActive(alert: AlertEntity): boolean {
  return alert.status === "active";
}

export function isAlertCritical(alert: AlertEntity): boolean {
  return alert.severity === "critical" && alert.status === "active";
}
