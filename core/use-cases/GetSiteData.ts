/**
 * GetSiteData.ts — Cas d'usage "lecture des données d'un site" (couche use-cases).
 * Role dans AURION : orchestre les repositories (site, capteurs, alertes) pour
 * construire la vue détaillée d'une salle serveur de Maisons-Alfort.
 * Reçoit : un identifiant de site. Produit : un objet SiteDetailData agrégé
 * (infos site + relevés capteurs + baies + alertes + état de supervision Zabbix).
 * Ne dépend que des INTERFACES de repositories (architecture clean, lecture seule).
 */
import type { ISiteRepository, SiteStats } from "../domain/repositories";
import type { ISensorRepository } from "../domain/repositories";
import type { IAlertRepository } from "../domain/repositories";
import type { SiteEntity, SiteWithSupervision, SensorReading, AlertEntity, BayEntity } from "../domain/entities";

// Forme de l'objet renvoyé au front : toutes les données d'un site rassemblées.
export interface SiteDetailData {
  site: SiteEntity;
  sensors: SensorReading[];
  bays: BayEntity[];
  alerts: AlertEntity[];
  supervision: SiteWithSupervision | null;
}

export class GetSiteData {
  // Injection des 3 repositories via le constructeur (inversion de dépendance).
  constructor(
    private siteRepo: ISiteRepository,
    private sensorRepo: ISensorRepository,
    private alertRepo: IAlertRepository
  ) {}

  async execute(siteId: string): Promise<SiteDetailData | null> {
    // 1) On vérifie d'abord que le site existe ; sinon on renvoie null (404 côté front).
    const site = await this.siteRepo.getById(siteId);
    if (!site) return null;

    // 2) On lance les 4 lectures EN PARALLELE (Promise.all) pour gagner du temps.
    //    Chaque .catch renvoie une valeur vide : si une source échoue (ex: Zabbix
    //    injoignable), on n'écroule pas toute la page, on affiche le reste.
    const [sensors, bays, alerts, supervised] = await Promise.all([
      this.sensorRepo.getCurrentReadings(siteId).catch(() => [] as SensorReading[]),
      this.sensorRepo.getBaysForSite(siteId).catch(() => [] as BayEntity[]),
      this.alertRepo.getBySite(siteId).catch(() => [] as AlertEntity[]),
      // On récupère la liste des sites supervisés puis on en extrait celui-ci (ou null).
      this.siteRepo.getSupervised().then(s => s.find(x => x.id === siteId) ?? null).catch(() => null),
    ]);

    // 3) On assemble tout dans un seul objet prêt à afficher.
    return { site, sensors, bays, alerts, supervision: supervised };
  }
}

// Cas d'usage simple : renvoyer la liste de tous les sites (pour la carte/liste).
export class GetAllSites {
  constructor(private siteRepo: ISiteRepository) {}

  async execute(): Promise<SiteEntity[]> {
    return this.siteRepo.getAll();
  }
}

// Cas d'usage simple : renvoyer les statistiques globales du parc de sites
// (totaux, sites supervisés, connectés à Zabbix...) pour le tableau de bord.
export class GetSiteStats {
  constructor(private siteRepo: ISiteRepository) {}

  async execute(): Promise<SiteStats> {
    return this.siteRepo.getStats();
  }
}
