// Fichier central des types TypeScript du projet AURION.
// À expliquer au jury : TypeScript permet de décrire la forme attendue des données.
// Exemple : un site doit avoir un nom, un statut, des coordonnées, une température, etc.
// L'objectif est d'éviter d'utiliser de mauvaises données dans les composants React.

export type SiteStatus = "ok" | "warning" | "critical" | "maintenance";
// SiteStatus limite les valeurs possibles du statut d'un site.
// Cela évite par exemple d'écrire un statut non prévu comme "grave" ou "erreur".

export type Severity = "info" | "minor" | "major" | "critical";
// Severity décrit le niveau de gravité d'une alerte.

export type SiteType = "administratif" | "sport" | "education" | "culture" | "securite" | "technique";
// SiteType décrit la catégorie générale d'un site dans l'ancien modèle de supervision.

export type UserRole = "super_admin" | "admin" | "tech" | "viewer";
// UserRole limite les rôles possibles d'un utilisateur.

// ─── Référentiel des sites — nouveaux types ───────────────────────────────────
export type AddressStatus = "verified" | "internal_only" | "needs_manual_validation";
// AddressStatus indique si l'adresse d'un site est vérifiée ou encore à contrôler.

export type ZabbixStatus = "not_connected" | "pending" | "partial" | "connected";
// ZabbixStatus indique le niveau de connexion du site à Zabbix.

export type SensorsStatus = "none" | "partial" | "active";
// SensorsStatus indique si des capteurs sont absents, partiellement présents ou actifs.

export type SiteCategory =
  | "administratif"
  | "école"
  | "culture"
  | "sport"
  | "service municipal"
  | "sécurité"
  | "quartier"
  | "restauration municipale"
  | "technique"
  | "autre";
// SiteCategory sert à classer les sites municipaux dans la cartographie AURION.

/** Statut d'inventaire d'un site */
export type InventoryStatus = "active" | "planned" | "maintenance";
// InventoryStatus distingue un site actif, prévu ou en maintenance.

/** Entrée média liée à un site */
export interface SiteMedia {
  // SiteMedia représente une photo, un plan ou un média lié à un site, une baie ou un équipement.
  id: string;
  url: string;
  /** PHOTO_LOCAL | PHOTO_BAY | ZOOM_EQUIPMENT | PLAN_PDF */
  type: string;
  confidence: number | null;
  siteId: string | null;
  localId: string | null;
  bayId: string | null;
  equipmentId: string | null;
  createdAt: string;
  local?: { id: string; name: string } | null;
  bay?: { id: string; name: string } | null;
}

/** Interface principale du référentiel des sites municipaux */
export interface SiteReference {
  // SiteReference est le modèle détaillé d'un site municipal dans le référentiel AURION.
  // Il mélange les informations administratives, cartographiques, Zabbix et Black Box.
  id: string;
  name: string;
  aliases?: string[];

  address: string | null;
  postalCode: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  addressStatus: AddressStatus;
  geocodingAttempts?: number;
  geocodingLastAttempt?: string | null;

  ltNames: string[];
  ltCount?: number;
  telephonyEquipment?: string | null;

  likelyManagedByDSI: boolean;
  category?: SiteCategory;

  zabbixStatus: ZabbixStatus;
  sensorsStatus: SensorsStatus;
  zabbixEnabled: boolean;
  zabbixHostId?: string | null;
  zabbixHostName?: string | null;
  zabbixTemplate?: string | null;
  zabbixLastSync?: string | null;
  zabbixError?: string | null;

  visibleOnMap: boolean;
  notes?: string | null;
  source?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;

  /** BlackBox ServSensor installé sur site */
  blackboxInstalled?: boolean;
  blackboxModel?: string | null;
  blackboxSerial?: string | null;
  blackboxInstalledAt?: string | null;
  blackboxInstalledBy?: string | null;
  blackboxFirmware?: string | null;
  blackboxBayCount?: number;

  /** Statut d'inventaire (issu du seed-inventory) */
  inventoryStatus?: InventoryStatus;

  /** Données de supervision live (fusion avec mock/Zabbix) */
  supervisionStatus?: SiteStatus;
  supervisionLastUpdate?: string;
}

// ─── Modèle legacy supervision (inchangé pour compatibilité) ─────────────────
export interface Site {
  // Site est le modèle simple utilisé par les cartes et dashboards historiques.
  // À l'oral : c'est une structure qui représente les données principales d'un site affiché.
  id: string;
  name: string;
  address: string;
  type: SiteType;
  status: SiteStatus;
  coordinates: [number, number];
  bayCount: number;
  alertCount: number;
  lastUpdate: string;
  temperature: number;
  humidity: number;
  uptime: number;
  powerConsumption: number;
}

export interface Bay {
  // Bay représente une baie ou zone technique dans un site.
  id: string;
  siteId: string;
  name: string;
  location: string;
  status: SiteStatus;
  sensors: Sensors;
  lastUpdate: string;
  powerConsumption: number;
  networkUsage: {
    inbound: number;
    outbound: number;
  };
}

export interface Sensors {
  // Sensors regroupe les différentes mesures ou états capteurs d'une baie.
  temperature: SensorReading;
  humidity: SensorReading;
  smoke: BinarySensor;
  water: BinarySensor;
  door: BinarySensor;
  vibration: SensorReading;
  power230v: BinarySensor;
  airflow: SensorReading;
  pressure: SensorReading;
}

export interface SensorReading {
  // SensorReading représente une mesure analogique : température, humidité, airflow, etc.
  value: number;
  unit: string;
  status: SiteStatus;
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdate: string;
}

export interface BinarySensor {
  // BinarySensor représente un capteur à deux états : eau détectée / non détectée, porte ouverte / fermée.
  active: boolean;
  status: SiteStatus;
  lastUpdate: string;
  lastTriggered?: string;
}

export interface Alert {
  // Alert représente une alerte affichée côté AURION.
  id: string;
  siteId: string;
  siteName: string;
  bayId?: string;
  bayName?: string;
  severity: Severity;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  sensorType?: string;
  value?: number;
  threshold?: number;
}

export interface HistoryEvent {
  // HistoryEvent représente un événement dans l'historique : alerte, maintenance, changement ou info.
  id: string;
  siteId: string;
  siteName: string;
  bayId?: string;
  type: "alert" | "maintenance" | "change" | "info";
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  severity?: Severity;
}

export interface User {
  // User représente un utilisateur de l'application.
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  createdBy?: string;
}

export interface Maintenance {
  // Maintenance représente une opération planifiée sur un site ou une baie.
  id: string;
  siteId: string;
  siteName: string;
  bayId?: string;
  title: string;
  description: string;
  scheduledDate: string;
  estimatedDuration: number;
  assignedTo?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  checklist?: ChecklistItem[];
  notes?: string;
  completedAt?: string;
}

export interface ChecklistItem {
  // ChecklistItem représente une ligne de checklist pour une intervention.
  id: string;
  label: string;
  completed: boolean;
}

export interface ZabbixConfig {
  // ZabbixConfig contient les informations de connexion logique à Zabbix.
  // Le token ne doit jamais être exposé côté client.
  apiUrl: string;
  apiToken?: string;
  connected: boolean;
  lastSync?: string;
}

export interface DashboardWidget {
  // DashboardWidget décrit un bloc personnalisable du dashboard.
  id: string;
  type: "kpi" | "chart" | "alerts" | "sites" | "custom";
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: any;
}

export interface ChatMessage {
  // ChatMessage représente un message dans l'assistant ou chatbot intégré.
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface NetworkDevice {
  // NetworkDevice représente un équipement réseau ou serveur lié à une baie.
  id: string;
  bayId: string;
  name: string;
  type: "switch" | "router" | "firewall" | "server";
  ipAddress: string;
  status: SiteStatus;
  uptime: number;
  ports: {
    total: number;
    used: number;
  };
}

export interface AuditLog {
  // AuditLog garde une trace d'une action faite dans l'application.
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: "user" | "site" | "config" | "alert";
  targetId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
