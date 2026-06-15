/**
 * ManageAlerts.ts — Cas d'usage de gestion des alertes (couche use-cases).
 * Role dans AURION : permettre à la DSI de prendre en compte (acquitter) et de
 * résoudre les alertes remontées par Zabbix, et d'en lire l'état/les statistiques.
 * Regroupe 4 cas d'usage : AcknowledgeAlert, ResolveAlert, GetActiveAlerts, GetAlertStats.
 * Chacun reçoit/produit des AlertEntity et valide les transitions de statut.
 */
import type { IAlertRepository } from "../domain/repositories";
import type { AlertEntity, AlertStatus } from "../domain/entities";

// Cas d'usage : ACQUITTER une alerte (un agent confirme l'avoir vue / prise en main).
export class AcknowledgeAlert {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(alertId: string, userName: string): Promise<AlertEntity> {
    // On vérifie que l'alerte existe avant toute action.
    const alert = await this.alertRepo.getById(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    // Garde-fou métier : on ne peut acquitter qu'une alerte ENCORE "active"
    // (pas une déjà acquittée ou résolue) -> évite les transitions incohérentes.
    if (alert.status !== "active") throw new Error(`Alert ${alertId} is already ${alert.status}`);
    return this.alertRepo.acknowledge(alertId, userName);
  }
}

// Cas d'usage : RESOUDRE une alerte (le problème est traité / terminé).
export class ResolveAlert {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(alertId: string): Promise<AlertEntity> {
    const alert = await this.alertRepo.getById(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);
    // Garde-fou : inutile (et incohérent) de re-résoudre une alerte déjà résolue.
    if (alert.status === "resolved") throw new Error(`Alert ${alertId} is already resolved`);
    return this.alertRepo.resolve(alertId);
  }
}

// Cas d'usage : lister uniquement les alertes actives (pour la bannière/tableau de bord).
export class GetActiveAlerts {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(): Promise<AlertEntity[]> {
    return this.alertRepo.getActive();
  }
}

// Cas d'usage : calculer les statistiques des alertes (cartes de synthèse du dashboard).
export class GetAlertStats {
  constructor(private alertRepo: IAlertRepository) {}

  async execute(): Promise<{ total: number; active: number; acknowledged: number; resolved: number; critical: number }> {
    // On récupère en parallèle la liste complète et le décompte déjà groupé par statut.
    const [all, counts] = await Promise.all([
      this.alertRepo.getAll(),
      this.alertRepo.getCountByStatus(),
    ]);
    // "critical" = alertes à la fois de sévérité critique ET encore actives :
    // c'est le chiffre qui doit alerter immédiatement la DSI.
    const critical = all.filter(a => a.severity === "critical" && a.status === "active").length;
    return {
      total: all.length,
      // "?? 0" : si un statut n'apparait pas dans le décompte, on affiche 0.
      active: counts.active ?? 0,
      acknowledged: counts.acknowledged ?? 0,
      resolved: counts.resolved ?? 0,
      critical,
    };
  }
}
