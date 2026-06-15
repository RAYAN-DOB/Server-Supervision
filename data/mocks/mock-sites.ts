import type { Site, Bay, Alert, Sensors } from "@/types";

const MAISONS_ALFORT_CENTER: [number, number] = [48.8064, 2.4379];

type SitePilotConfig = {
  bayCount: number;
  gatewayName: string;
  gatewayLocation: string;
  temperature: number;
  humidity: number;
  powerW: number;
};

const PILOT_CONFIG: Record<string, SitePilotConfig> = {
  HTDV: {
    bayCount: 4,
    gatewayName: "BLACKBOX-HTDV",
    gatewayLocation: "Salle serveur HTDV - gateway EME168A unique",
    temperature: 22.5,
    humidity: 45,
    powerW: 12,
  },
  PLDS: {
    bayCount: 2,
    gatewayName: "BLACKBOX-PLDS",
    gatewayLocation: "Salle serveur PLDS - gateway EME168A unique",
    temperature: 23.2,
    humidity: 48,
    powerW: 8,
  },
  "DEMO-LAB": {
    bayCount: 1,
    gatewayName: "BLACKBOX-DEMO",
    gatewayLocation: "Module 0 - Port 1",
    temperature: 22.8,
    humidity: 53,
    powerW: 4,
  },
};

/**
 * Sites actifs dans AURION : les deux sites pilotes DSI et un site laboratoire
 * utilise pour valider la chaine Black Box / Zabbix sans modifier la production.
 */
export const MOCK_SITES: Site[] = [
  {
    id: "HTDV",
    name: "Hotel de Ville",
    address: "118 avenue du General de Gaulle, 94700 Maisons-Alfort",
    type: "administratif",
    status: "ok",
    coordinates: [48.8058, 2.4392],
    bayCount: 4,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.5,
    humidity: 45,
    uptime: 99.8,
    powerConsumption: 12,
  },
  {
    id: "PLDS",
    name: "Palais des Sports",
    address: "4 rue Edouard Herriot, 94700 Maisons-Alfort",
    type: "sport",
    status: "warning",
    coordinates: [48.8012, 2.4318],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 23.2,
    humidity: 48,
    uptime: 99.1,
    powerConsumption: 8,
  },
  {
    id: "DEMO-LAB",
    name: "Lab Black Box",
    address: "Site laboratoire AURION - Proxmox / Zabbix / Black Box",
    type: "technique",
    status: "ok",
    coordinates: MAISONS_ALFORT_CENTER,
    bayCount: 1,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.8,
    humidity: 53,
    uptime: 99.1,
    powerConsumption: 4,
  },
];

export function generateSensors(baseTemp: number = 22, status: string = "ok", baseHumidity = 45): Sensors {
  const now = new Date().toISOString();
  const temperature = baseTemp;
  const humidity = baseHumidity;

  return {
    temperature: {
      value: temperature,
      unit: "C",
      status: temperature > 30 ? "critical" : temperature > 27 ? "warning" : "ok",
      threshold: { warning: 27, critical: 30 },
      lastUpdate: now,
    },
    humidity: {
      value: humidity,
      unit: "%",
      status: humidity > 75 || humidity < 30 ? "critical" : humidity > 60 || humidity < 40 ? "warning" : "ok",
      threshold: { warning: 60, critical: 75 },
      lastUpdate: now,
    },
    smoke: {
      active: status === "critical",
      status: status === "critical" ? "critical" : "ok",
      lastUpdate: now,
    },
    water: {
      active: false,
      status: "ok",
      lastUpdate: now,
    },
    door: {
      active: false,
      status: "ok",
      lastUpdate: now,
    },
    vibration: {
      value: 0,
      unit: "g",
      status: "ok",
      threshold: { warning: 0.3, critical: 0.5 },
      lastUpdate: now,
    },
    power230v: {
      active: true,
      status: "ok",
      lastUpdate: now,
    },
    airflow: {
      value: 0,
      unit: "m3/h",
      status: "ok",
      threshold: { warning: 80, critical: 60 },
      lastUpdate: now,
    },
    pressure: {
      value: 0,
      unit: "hPa",
      status: "ok",
      threshold: { warning: 1005, critical: 1000 },
      lastUpdate: now,
    },
  };
}

export function getPilotSiteConfig(siteId: string): SitePilotConfig | undefined {
  return PILOT_CONFIG[siteId];
}

export function generateBaysForSite(siteId: string, siteName: string, count: number): Bay[] {
  const config = PILOT_CONFIG[siteId];
  const bayCount = config?.bayCount ?? count;

  return Array.from({ length: bayCount }, (_, index) => {
    const bayNumber = index + 1;
    const baseTemp = (config?.temperature ?? 22) + index * 0.2;
    const baseHumidity = (config?.humidity ?? 45) + (index % 2);
    const isPilotSite = Boolean(config);

    return {
      id: `${siteId}-bay-${bayNumber}`,
      siteId,
      name: isPilotSite ? `Baie ${siteId} ${bayNumber}` : `Baie ${bayNumber}`,
      location: config?.gatewayLocation ?? `Salle serveur ${Math.ceil(bayNumber / 2)}`,
      status: siteId === "PLDS" ? "warning" : "ok",
      sensors: generateSensors(baseTemp, "ok", baseHumidity),
      lastUpdate: new Date().toISOString(),
      powerConsumption: config?.powerW ?? 2,
      networkUsage: {
        inbound: 0,
        outbound: 0,
      },
    };
  });
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-htdv-ok",
    siteId: "HTDV",
    siteName: "Hotel de Ville",
    bayId: "HTDV-bay-1",
    bayName: "Baie HTDV 1",
    severity: "info",
    title: "Controle capteurs HTDV OK",
    description: "Gateway BLACKBOX-HTDV et capteurs environnementaux declares pour la supervision.",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Systeme AURION",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 89).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 89).toISOString(),
    sensorType: "temperature",
  },
  {
    id: "alert-plds-prep",
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayId: "PLDS-bay-1",
    bayName: "Baie PLDS 1",
    severity: "info",
    title: "Preparation raccordement PLDS",
    description: "La gateway BLACKBOX-PLDS est referencee. Le flux VLAN / Stormshield / SNMPv3 doit etre valide en production avant activation complete.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Rayan DOB",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    sensorType: "snmp",
  },
];

export function generateDynamicAlert(site: Site, bay?: Bay): Alert {
  const alertTypes = [
    { title: "Temperature anormale", description: "Variation de temperature detectee", sensor: "temperature" },
    { title: "Humidite hors norme", description: "Taux d'humidite inhabituel", sensor: "humidity" },
    { title: "Eau detectee", description: "Presence d'eau detectee au sol", sensor: "water" },
    { title: "Porte ouverte", description: "Ouverture de porte detectee", sensor: "door" },
    { title: "Tension secteur absente", description: "Perte de tension 230V detectee", sensor: "power" },
  ];
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

  return {
    id: `alert-${Date.now()}-${Math.random()}`,
    siteId: site.id,
    siteName: site.name,
    bayId: bay?.id,
    bayName: bay?.name,
    severity: "major",
    title: alertType.title,
    description: alertType.description,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: alertType.sensor,
  };
}
