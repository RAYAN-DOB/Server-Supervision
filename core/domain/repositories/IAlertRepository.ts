/**
 * IAlertRepository.ts — Contrat (interface) d'accès aux ALERTES (couche domain).
 * Role dans AURION : définit la lecture et les changements d'état des alertes
 * (acquitter, résoudre, compter) issues de Zabbix, sans préciser l'implémentation.
 * Utilisé par les use-cases ManageAlerts et GetSiteData.
 */
import type { AlertEntity, AlertStatus } from "../entities";

export interface IAlertRepository {
  getAll(): Promise<AlertEntity[]>;                 // Toutes les alertes.
  getActive(): Promise<AlertEntity[]>;              // Uniquement les alertes actives.
  getBySite(siteId: string): Promise<AlertEntity[]>; // Alertes d'un site donné.
  getById(id: string): Promise<AlertEntity | null>;  // Une alerte précise (ou null).
  acknowledge(id: string, userName: string): Promise<AlertEntity>; // Acquitter (qui l'a vue).
  resolve(id: string): Promise<AlertEntity>;         // Marquer comme résolue.
  create(alert: Omit<AlertEntity, "id">): Promise<AlertEntity>; // Créer (id généré côté impl.).
  getCountByStatus(): Promise<Record<AlertStatus, number>>; // Décompte groupé par statut.
}
