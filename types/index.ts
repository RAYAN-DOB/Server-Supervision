export type SiteStatus = "ok" | "warning" | "critical" | "maintenance";
export type Severity = "info" | "minor" | "major" | "critical";
export type SiteType = "administratif" | "sport" | "education" | "culture" | "securite" | "technique";
export type UserRole = "super_admin" | "admin" | "tech" | "viewer";

// ─── Référentiel des sites — nouveaux types ───────────────────────────────────
export type AddressStatus = "verified" | "internal_only" | "needs_manual_validation";
export type ZabbixStatus = "not_connected" | "pending" | "partial" | "connected";
export type SensorsStatus = "none" | "partial" | "active";

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

/** Interface principale du référentiel des sites municipaux */
export interface SiteReference {
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

  /** Données de supervision live (fusion avec mock/Zabbix) */
  supervisionStatus?: SiteStatus;
  supervisionLastUpdate?: string;
}

// ─── Modèle legacy supervision (inchangé pour compatibilité) ─────────────────
export interface Site {
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
  active: boolean;
  status: SiteStatus;
  lastUpdate: string;
  lastTriggered?: string;
}

export interface Alert {
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
  id: string;
  label: string;
  completed: boolean;
}

export interface ZabbixConfig {
  apiUrl: string;
  apiToken?: string;
  connected: boolean;
  lastSync?: string;
}

export interface DashboardWidget {
  id: string;
  type: "kpi" | "chart" | "alerts" | "sites" | "custom";
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: any;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface NetworkDevice {
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
