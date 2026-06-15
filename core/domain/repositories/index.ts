/**
 * index.ts (repositories) — Point d'entrée unique des contrats de repositories (domain).
 * Role dans AURION : "barrel file" qui ré-exporte les interfaces d'accès aux données
 * (sites, capteurs, alertes) pour les importer depuis "core/domain/repositories".
 * Uniquement des ré-exports de TYPES : aucune logique ni implémentation ici.
 */
export type { ISiteRepository, SiteStats } from "./ISiteRepository";
export type { ISensorRepository } from "./ISensorRepository";
export type { IAlertRepository } from "./IAlertRepository";
