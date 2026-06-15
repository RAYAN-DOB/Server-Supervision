// ============================================================================
// AlertEntity — Entite "Alerte" du domaine AURION (couche core/domain)
// ----------------------------------------------------------------------------
// Role : representer une alerte de supervision (ex : temperature trop haute)
//        remontee par Zabbix ou une blackbox, puis presentee a la DSI.
// Contient : le type d'alerte (AlertEntity) + des fonctions utilitaires pures
//            pour interpreter son etat (active ? critique ? conversion legacy).
// ============================================================================

// Niveau de gravite d'une alerte, du moins au plus grave.
export type AlertSeverity = "info" | "minor" | "major" | "critical";
// Cycle de vie d'une alerte : active -> acquittee (vue par un agent) -> resolue.
export type AlertStatus = "active" | "acknowledged" | "resolved";

// AlertEntity : description complete d'une alerte (qui, quoi, quand, etat, source).
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
  sensorType?: string;         // type de capteur a l'origine de l'alerte
  value?: number;              // valeur mesuree ayant declenche l'alerte
  threshold?: number;          // seuil franchi
  source: "blackbox" | "zabbix" | "manual" | "system"; // provenance de l'alerte
}

// alertStatusFromLegacy : convertit l'ancien format (2 booleens acquitte/resolu)
// vers le nouveau statut unique. L'ordre est important : "resolu" prime sur
// "acquitte", lui-meme prime sur "actif".
export function alertStatusFromLegacy(acknowledged: boolean, resolved: boolean): AlertStatus {
  if (resolved) return "resolved";
  if (acknowledged) return "acknowledged";
  return "active";
}

// isAlertActive : true si l'alerte est encore en cours (ni acquittee ni resolue).
export function isAlertActive(alert: AlertEntity): boolean {
  return alert.status === "active";
}

// isAlertCritical : true seulement si l'alerte est critique ET toujours active.
// On exclut volontairement les alertes critiques deja traitees (acquittees/resolues).
export function isAlertCritical(alert: AlertEntity): boolean {
  return alert.severity === "critical" && alert.status === "active";
}
