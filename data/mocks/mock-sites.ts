import type { Site, Bay, Alert, Sensors } from "@/types";

const MAISONS_ALFORT_CENTER: [number, number] = [48.8064, 2.4379];

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
    bayCount: 5,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.5,
    humidity: 45,
    uptime: 99.8,
    powerConsumption: 12.5,
  },
  {
    id: "PLDS",
    name: "Palais des Sports",
    address: "4 rue Edouard Herriot, 94700 Maisons-Alfort",
    type: "sport",
    status: "warning",
    coordinates: [48.8012, 2.4318],
    bayCount: 3,
    alertCount: 2,
    lastUpdate: new Date().toISOString(),
    temperature: 26.8,
    humidity: 52,
    uptime: 98.5,
    powerConsumption: 8.3,
  },
  {
    id: "DEMO-LAB",
    name: "Lab Black Box",
    address: "Site laboratoire AURION - Proxmox / Zabbix / Black Box",
    type: "technique",
    status: "warning",
    coordinates: MAISONS_ALFORT_CENTER,
    bayCount: 1,
    alertCount: 1,
    lastUpdate: new Date().toISOString(),
    temperature: 28.4,
    humidity: 48,
    uptime: 99.1,
    powerConsumption: 0.2,
  },
];

export function generateSensors(baseTemp: number = 22, status: string = "ok"): Sensors {
  const now = new Date().toISOString();
  const tempVariation = Math.sin(Date.now() / 10000) * 2;
  const humidityVariation = Math.cos(Date.now() / 15000) * 3;

  const temperature = baseTemp + tempVariation;
  const humidity = 45 + humidityVariation;

  return {
    temperature: {
      value: temperature,
      unit: "C",
      status: temperature > 30 ? "critical" : temperature > 25 ? "warning" : "ok",
      threshold: { warning: 25, critical: 30 },
      lastUpdate: now,
    },
    humidity: {
      value: humidity,
      unit: "%",
      status: humidity > 70 || humidity < 30 ? "critical" : humidity > 60 || humidity < 40 ? "warning" : "ok",
      threshold: { warning: 60, critical: 70 },
      lastUpdate: now,
    },
    smoke: {
      active: status === "critical" ? Math.random() > 0.8 : false,
      status: "ok",
      lastUpdate: now,
    },
    water: {
      active: false,
      status: "ok",
      lastUpdate: now,
    },
    door: {
      active: Math.random() > 0.9,
      status: "ok",
      lastUpdate: now,
    },
    vibration: {
      value: Math.random() * 0.5,
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
      value: 120 + Math.random() * 20,
      unit: "m3/h",
      status: "ok",
      threshold: { warning: 80, critical: 60 },
      lastUpdate: now,
    },
    pressure: {
      value: 1013 + Math.random() * 5,
      unit: "hPa",
      status: "ok",
      threshold: { warning: 1005, critical: 1000 },
      lastUpdate: now,
    },
  };
}

export function generateBaysForSite(siteId: string, siteName: string, count: number): Bay[] {
  const bays: Bay[] = [];

  for (let i = 1; i <= count; i++) {
    const status = i === 2 && siteName.includes("Palais") ? "warning" : "ok";
    const isBlackBox = siteId === "HTDV" || siteId === "PLDS" || siteId === "DEMO-LAB";

    bays.push({
      id: `${siteId}-bay-${i}`,
      siteId,
      name: isBlackBox ? `Baie BlackBox ${i}` : `Baie ${i}`,
      location: isBlackBox ? `Local technique - BlackBox ServSensor ${i}` : `Salle serveur ${Math.ceil(i / 2)}`,
      status,
      sensors: generateSensors(22 + i, status),
      lastUpdate: new Date().toISOString(),
      powerConsumption: 2 + Math.random() * 3,
      networkUsage: {
        inbound: Math.random() * 1000,
        outbound: Math.random() * 500,
      },
    });
  }

  return bays;
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-lab-1",
    siteId: "DEMO-LAB",
    siteName: "Lab Black Box",
    bayId: "DEMO-LAB-bay-1",
    bayName: "Baie laboratoire Black Box",
    severity: "major",
    title: "Temperature elevee - Lab Black Box",
    description: "Le capteur Black Box du site laboratoire depasse le seuil Warning configure dans Zabbix.",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 28.4,
    threshold: 27,
  },
  {
    id: "alert-1",
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayId: "PLDS-bay-1",
    bayName: "Baie BlackBox 1",
    severity: "major",
    title: "Temperature en hausse - BlackBox ServSensor",
    description: "Le capteur Black Box signale une montee en temperature anormale dans la salle technique.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 26.8,
    threshold: 25,
  },
  {
    id: "alert-2",
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayId: "PLDS-bay-2",
    bayName: "Baie BlackBox 2",
    severity: "minor",
    title: "Porte baie ouverte - BlackBox ServSensor",
    description: "Le capteur de contact signale que la porte de la baie est restee ouverte depuis plus de 30 minutes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Rayan DOB",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    resolved: false,
  },
  {
    id: "alert-3",
    siteId: "HTDV",
    siteName: "Hotel de Ville",
    bayId: "HTDV-bay-3",
    bayName: "Baie BlackBox 3",
    severity: "info",
    title: "Rapport hebdomadaire - BlackBox ServSensor",
    description: "Tous les capteurs fonctionnent normalement. Temperature stable, humidite normale et alimentation OK.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Systeme automatique",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
  },
  {
    id: "alert-4",
    siteId: "HTDV",
    siteName: "Hotel de Ville",
    bayId: "HTDV-bay-1",
    bayName: "Baie BlackBox 1",
    severity: "info",
    title: "Test capteurs effectue",
    description: "Test mensuel automatique des capteurs Black Box ServSensor. Tous les modules repondent correctement.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Systeme automatique",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000).toISOString(),
  },
];

export function generateDynamicAlert(site: Site, bay?: Bay): Alert {
  const severities: ("info" | "minor" | "major" | "critical")[] = ["info", "minor", "major", "critical"];
  const severity = severities[Math.floor(Math.random() * severities.length)];

  const alertTypes = [
    { title: "Temperature anormale", description: "Variation de temperature detectee", sensor: "temperature" },
    { title: "Humidite hors norme", description: "Taux d'humidite inhabituel", sensor: "humidity" },
    { title: "Porte ouverte", description: "Acces detecte", sensor: "door" },
    { title: "Vibration detectee", description: "Mouvement inhabituel", sensor: "vibration" },
  ];

  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

  return {
    id: `alert-${Date.now()}-${Math.random()}`,
    siteId: site.id,
    siteName: site.name,
    bayId: bay?.id,
    bayName: bay?.name,
    severity,
    title: alertType.title,
    description: alertType.description,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: alertType.sensor,
  };
}
