// ============================================================================
// SiteEntity — Entite "Site" du domaine AURION (couche core/domain)
// ----------------------------------------------------------------------------
// Role : decrit ce qu'est un SITE supervise (ex : une salle serveur de la Ville
//        de Maisons-Alfort), independamment de la source de donnees (Zabbix, BDD).
// Ce fichier ne contient que des TYPES (interfaces) : il definit la "forme" des
// donnees manipulees partout dans l'application (use-cases, lib, composants).
// Recoit/produit : rien a l'execution (pas de code), c'est un contrat de donnees.
// ============================================================================
import type { SiteStatus, Severity, SiteCategory, AddressStatus, ZabbixStatus, SensorsStatus } from "@/types";

// SiteEntity : informations "statiques" d'un site (identite, adresse, config Zabbix).
// Ces champs decrivent le site lui-meme, pas ses mesures temps reel.
export interface SiteEntity {
  id: string;
  name: string;
  aliases?: string[];
  address: string | null;
  postalCode: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  addressStatus: AddressStatus;
  ltNames: string[];
  ltCount: number;
  telephonyEquipment?: string | null;
  likelyManagedByDSI: boolean;
  category?: SiteCategory;
  // Champs lies a la supervision Zabbix : indiquent si le site est rattache a
  // Zabbix et sous quel identifiant d'hote (zabbixHostId) on lit ses donnees.
  zabbixStatus: ZabbixStatus;
  sensorsStatus: SensorsStatus;
  zabbixEnabled: boolean;
  zabbixHostId?: string | null; // ID de l'hote cote Zabbix (cle pour les requetes API)
  visibleOnMap: boolean;
  notes?: string | null;
  blackboxInstalled?: boolean;
  blackboxModel?: string | null;
  blackboxSerial?: string | null;
  createdAt: string;
  updatedAt: string;
}

// SiteWithSupervision : un site ENRICHI des mesures temps reel lues dans Zabbix.
// On part du SiteEntity (extends) et on ajoute l'etat live : temperature,
// humidite, nombre d'alertes, etc. C'est cette forme qui est affichee a la DSI.
export interface SiteWithSupervision extends SiteEntity {
  status: SiteStatus;          // etat global synthetique (ok / alerte / critique...)
  temperature: number;
  humidity: number;
  uptime: number;
  powerConsumption: number;
  bayCount: number;            // nombre de baies informatiques sur le site
  alertCount: number;          // nombre d'alertes actives remontees par Zabbix
  lastUpdate: string;          // horodatage de la derniere donnee recue
}
