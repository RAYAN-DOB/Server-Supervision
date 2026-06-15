/**
 * ISiteRepository.ts — Contrat (interface) d'accès aux SITES (couche domain).
 * Role dans AURION : définit CE QUE l'on peut faire avec les sites, sans dire COMMENT.
 * L'implémentation concrète (Prisma/Zabbix) vit dans lib/infrastructure ; les use-cases
 * ne dépendent que de cette interface (inversion de dépendance, architecture clean).
 * Déclare aussi SiteStats, la forme des statistiques globales du parc.
 */
import type { SiteEntity, SiteWithSupervision } from "../entities";

export interface ISiteRepository {
  getAll(): Promise<SiteEntity[]>;                 // Tous les sites.
  getById(id: string): Promise<SiteEntity | null>; // Un site précis (ou null si absent).
  getSupervised(): Promise<SiteWithSupervision[]>;  // Sites réellement supervisés par Zabbix.
  update(id: string, data: Partial<SiteEntity>): Promise<SiteEntity>; // MAJ partielle d'un site.
  getStats(): Promise<SiteStats>;                  // Statistiques agrégées du parc.
}

// Statistiques globales affichées sur le tableau de bord (compteurs du parc de sites).
export interface SiteStats {
  total: number;
  withCoordinates: number;
  withoutCoordinates: number;
  withLT: number;
  connectedZabbix: number;
  dsiManaged: number;
  addressVerified: number;
  blackboxInstalled: number;
  supervised: number;
}
