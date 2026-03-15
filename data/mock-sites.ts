import type { Site, Bay, Alert, Sensors } from "@/types";

// Coordonnées GPS réelles de Maisons-Alfort
const MAISONS_ALFORT_CENTER: [number, number] = [48.8064, 2.4379];

export const MOCK_SITES: Site[] = [
  {
    // ID aligné avec le référentiel pour que la fiche complète s'affiche
    id: "HTDV",
    name: "Hôtel de Ville",
    address: "118 avenue du Général de Gaulle, 94700 Maisons-Alfort",
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
    // ID aligné avec le référentiel — BlackBox ServSensor installé
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
    id: "CTM",
    name: "Centre Technique Municipal",
    address: "39 avenue Gambetta, 94700 Maisons-Alfort",
    type: "technique",
    status: "ok",
    coordinates: [48.8025, 2.4287],
    bayCount: 4,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 21.3,
    humidity: 48,
    uptime: 99.9,
    powerConsumption: 15.2,
  },
  {
    id: "MQAM",
    name: "Médiathèque André Malraux",
    address: "4 rue Albert Camus, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8034, 2.4301],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 23.1,
    humidity: 46,
    uptime: 99.5,
    powerConsumption: 4.8,
  },
  {
    id: "PCML",
    name: "Police Municipale",
    address: "2 rue Pasteur, 94700 Maisons-Alfort",
    type: "securite",
    status: "ok",
    coordinates: [48.8061, 2.4398],
    bayCount: 3,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 21.8,
    humidity: 46,
    uptime: 99.9,
    powerConsumption: 7.2,
  },
  {
    id: "CVHD",
    name: "Conservatoire Henri Dutilleux",
    address: "83/85 rue Victor Hugo, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8039, 2.4358],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.0,
    humidity: 44,
    uptime: 99.4,
    powerConsumption: 3.8,
  },
  {
    id: "NECC",
    name: "Nouvel Espace Culturel Charentonneau",
    address: "107 avenue Gambetta, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8008, 2.4269],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.3,
    humidity: 48,
    uptime: 99.8,
    powerConsumption: 6.1,
  },
  {
    id: "THEA_DEB",
    name: "Théâtre Claude Debussy",
    address: "116 avenue du Général de Gaulle, 94700 Maisons-Alfort",
    type: "culture",
    status: "maintenance",
    coordinates: [48.8055, 2.4387],
    bayCount: 1,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 20.5,
    humidity: 50,
    uptime: 95.0,
    powerConsumption: 3.2,
  },
  {
    id: "CTAQ",
    name: "Centre Aquatique",
    address: "55 rue du 11 novembre 1918, 94700 Maisons-Alfort",
    type: "sport",
    status: "ok",
    coordinates: [48.7989, 2.4256],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 24.8,
    humidity: 65,
    uptime: 99.2,
    powerConsumption: 9.4,
  },
  {
    id: "EEPB",
    name: "École Élémentaire Paul Bert",
    address: "37 avenue du Général Leclerc, 94700 Maisons-Alfort",
    type: "education",
    status: "ok",
    coordinates: [48.8093, 2.4412],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.8,
    humidity: 47,
    uptime: 99.2,
    powerConsumption: 5.5,
  },
  {
    id: "EEPM",
    name: "École Élémentaire Parmentier",
    address: "8 rue Paul Vaillant Couturier, 94700 Maisons-Alfort",
    type: "education",
    status: "ok",
    coordinates: [48.8095, 2.4441],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.4,
    humidity: 47,
    uptime: 99.1,
    powerConsumption: 5.2,
  },
  {
    id: "EEJF",
    name: "École Élémentaire Jules Ferry",
    address: "218bis rue Jean Jaurès, 94700 Maisons-Alfort",
    type: "education",
    status: "critical",
    coordinates: [48.7992, 2.4248],
    bayCount: 4,
    alertCount: 3,
    lastUpdate: new Date().toISOString(),
    temperature: 31.2,
    humidity: 68,
    uptime: 97.2,
    powerConsumption: 18.5,
  },
];

// Générateur de capteurs avec variation dynamique
export function generateSensors(baseTemp: number = 22, status: string = "ok"): Sensors {
  const now = new Date().toISOString();
  const tempVariation = Math.sin(Date.now() / 10000) * 2; // Variation sinusoïdale
  const humidityVariation = Math.cos(Date.now() / 15000) * 3;
  
  const temperature = baseTemp + tempVariation;
  const humidity = 45 + humidityVariation;
  
  return {
    temperature: {
      value: temperature,
      unit: "°C",
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
      unit: "m³/h",
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

// Générateur de baies pour un site
export function generateBaysForSite(siteId: string, siteName: string, count: number): Bay[] {
  const bays: Bay[] = [];
  
  for (let i = 1; i <= count; i++) {
    const status = i === 1 && siteName.includes("Marché") ? "critical" : 
                   i === 2 && siteName.includes("Palais") ? "warning" : "ok";
    
    const isBlackBox = siteId === "HTDV" || siteId === "PLDS";
    bays.push({
      id: `${siteId}-bay-${i}`,
      siteId,
      name: isBlackBox ? `Baie BlackBox ${i}` : `Baie ${i}`,
      location: isBlackBox ? `Local technique — BlackBox ServSensor ${i}` : `Salle serveur ${Math.ceil(i / 2)}`,
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
    id: "alert-1",
    siteId: "EEJF",
    siteName: "École Élémentaire Jules Ferry",
    bayId: "EEJF-bay-1",
    bayName: "Baie 1",
    severity: "critical",
    title: "Température Critique",
    description: "La température a dépassé le seuil critique de 30°C dans la salle serveur",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 31.2,
    threshold: 30,
  },
  {
    id: "alert-2",
    siteId: "EEJF",
    siteName: "École Élémentaire Jules Ferry",
    bayId: "EEJF-bay-2",
    bayName: "Baie 2",
    severity: "major",
    title: "Humidité Élevée",
    description: "Le taux d'humidité a dépassé le seuil d'alerte de 60%",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: "humidity",
    value: 68,
    threshold: 60,
  },
  {
    id: "alert-3",
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayId: "PLDS-bay-1",
    bayName: "Baie BlackBox 1",
    severity: "major",
    title: "Température en hausse — BlackBox ServSensor",
    description: "Le capteur BlackBox signale une montée en température anormale dans la salle technique",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 26.8,
    threshold: 25,
  },
  {
    id: "alert-4",
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayId: "PLDS-bay-2",
    bayName: "Baie BlackBox 2",
    severity: "minor",
    title: "Porte baie ouverte — BlackBox ServSensor",
    description: "Le capteur de contact signale que la porte de la baie est restée ouverte",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Rayan DOB",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    resolved: false,
  },
  {
    id: "alert-5",
    siteId: "EEJF",
    siteName: "École Élémentaire Jules Ferry",
    severity: "critical",
    title: "Climatisation Défaillante",
    description: "Le système de climatisation de la salle serveur ne répond plus",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    acknowledged: false,
    resolved: false,
  },
  {
    id: "alert-6",
    siteId: "HTDV",
    siteName: "Hôtel de Ville",
    bayId: "HTDV-bay-3",
    bayName: "Baie BlackBox 3",
    severity: "info",
    title: "Rapport hebdomadaire — BlackBox ServSensor",
    description: "Tous les capteurs fonctionnent normalement. Température stable à 22.5°C.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Système automatique",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
  },
];

// Fonction pour générer des alertes dynamiques
export function generateDynamicAlert(site: Site, bay?: Bay): Alert {
  const severities: ("info" | "minor" | "major" | "critical")[] = ["info", "minor", "major", "critical"];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const alertTypes = [
    { title: "Température anormale", description: "Variation de température détectée", sensor: "temperature" },
    { title: "Humidité hors norme", description: "Taux d'humidité inhabituel", sensor: "humidity" },
    { title: "Porte ouverte", description: "Accès détecté", sensor: "door" },
    { title: "Vibration détectée", description: "Mouvement inhabituel", sensor: "vibration" },
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
