import type { Site, Bay, Alert, Sensors } from "@/types";

// Coordonnées GPS réelles de Maisons-Alfort
const MAISONS_ALFORT_CENTER: [number, number] = [48.8064, 2.4379];

export const MOCK_SITES: Site[] = [
  {
    id: "site-1",
    name: "Hôtel de Ville",
    address: "53 Avenue du Général de Gaulle, 94700 Maisons-Alfort",
    type: "administratif",
    status: "ok",
    coordinates: [48.8064, 2.4379],
    bayCount: 5,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.5,
    humidity: 45,
    uptime: 99.8,
    powerConsumption: 12.5,
  },
  {
    id: "site-2",
    name: "Palais des Sports",
    address: "1 Avenue de la République, 94700 Maisons-Alfort",
    type: "sport",
    status: "warning",
    coordinates: [48.8103, 2.4325],
    bayCount: 3,
    alertCount: 2,
    lastUpdate: new Date().toISOString(),
    temperature: 26.8,
    humidity: 52,
    uptime: 98.5,
    powerConsumption: 8.3,
  },
  {
    id: "site-3",
    name: "Centre Technique Municipal",
    address: "15 Rue Paul Verlaine, 94700 Maisons-Alfort",
    type: "technique",
    status: "ok",
    coordinates: [48.8015, 2.4452],
    bayCount: 4,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 21.3,
    humidity: 48,
    uptime: 99.9,
    powerConsumption: 15.2,
  },
  {
    id: "site-4",
    name: "Médiathèque Abbé Grégoire",
    address: "17 Avenue Victor Hugo, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8089, 2.4405],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 23.1,
    humidity: 46,
    uptime: 99.5,
    powerConsumption: 4.8,
  },
  {
    id: "site-5",
    name: "École Jean Moulin",
    address: "8 Rue Jean Moulin, 94700 Maisons-Alfort",
    type: "education",
    status: "ok",
    coordinates: [48.8051, 2.4315],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.8,
    humidity: 47,
    uptime: 99.2,
    powerConsumption: 5.5,
  },
  {
    id: "site-6",
    name: "École Victor Hugo",
    address: "25 Avenue Victor Hugo, 94700 Maisons-Alfort",
    type: "education",
    status: "ok",
    coordinates: [48.8120, 2.4368],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 23.2,
    humidity: 45,
    uptime: 99.7,
    powerConsumption: 5.1,
  },
  {
    id: "site-7",
    name: "École Jules Ferry",
    address: "12 Rue Jules Ferry, 94700 Maisons-Alfort",
    type: "education",
    status: "maintenance",
    coordinates: [48.8087, 2.4287],
    bayCount: 1,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 20.5,
    humidity: 50,
    uptime: 95.0,
    powerConsumption: 3.2,
  },
  {
    id: "site-8",
    name: "Conservatoire",
    address: "6 Rue de l'Église, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8072, 2.4412],
    bayCount: 1,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.0,
    humidity: 44,
    uptime: 99.4,
    powerConsumption: 3.8,
  },
  {
    id: "site-9",
    name: "Police Municipale",
    address: "2 Place de la Mairie, 94700 Maisons-Alfort",
    type: "securite",
    status: "ok",
    coordinates: [48.8068, 2.4391],
    bayCount: 3,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 21.8,
    humidity: 46,
    uptime: 99.9,
    powerConsumption: 7.2,
  },
  {
    id: "site-10",
    name: "Centre de Secours",
    address: "45 Avenue du Général Leclerc, 94700 Maisons-Alfort",
    type: "securite",
    status: "ok",
    coordinates: [48.8025, 2.4398],
    bayCount: 2,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 22.3,
    humidity: 48,
    uptime: 99.8,
    powerConsumption: 6.1,
  },
  {
    id: "site-11",
    name: "Marché d'Intérêt National",
    address: "1 Avenue de la Liberté, 94700 Maisons-Alfort",
    type: "technique",
    status: "critical",
    coordinates: [48.7989, 2.4456],
    bayCount: 4,
    alertCount: 3,
    lastUpdate: new Date().toISOString(),
    temperature: 31.2,
    humidity: 68,
    uptime: 97.2,
    powerConsumption: 18.5,
  },
  {
    id: "site-12",
    name: "Maison des Associations",
    address: "10 Rue Parmentier, 94700 Maisons-Alfort",
    type: "culture",
    status: "ok",
    coordinates: [48.8092, 2.4345],
    bayCount: 1,
    alertCount: 0,
    lastUpdate: new Date().toISOString(),
    temperature: 23.5,
    humidity: 47,
    uptime: 99.1,
    powerConsumption: 3.5,
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
    
    bays.push({
      id: `${siteId}-bay-${i}`,
      siteId,
      name: `Baie ${i}`,
      location: `Salle serveur ${Math.ceil(i / 2)}`,
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
    siteId: "site-11",
    siteName: "Marché d'Intérêt National",
    bayId: "site-11-bay-1",
    bayName: "Baie 1",
    severity: "critical",
    title: "Température Critique",
    description: "La température a dépassé le seuil critique de 30°C",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 31.2,
    threshold: 30,
  },
  {
    id: "alert-2",
    siteId: "site-11",
    siteName: "Marché d'Intérêt National",
    bayId: "site-11-bay-2",
    bayName: "Baie 2",
    severity: "major",
    title: "Humidité Élevée",
    description: "L'humidité a dépassé le seuil de 60%",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    acknowledged: false,
    resolved: false,
    sensorType: "humidity",
    value: 68,
    threshold: 60,
  },
  {
    id: "alert-3",
    siteId: "site-2",
    siteName: "Palais des Sports",
    bayId: "site-2-bay-1",
    bayName: "Baie 1",
    severity: "major",
    title: "Température en hausse",
    description: "La température approche le seuil critique",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    acknowledged: false,
    resolved: false,
    sensorType: "temperature",
    value: 26.8,
    threshold: 25,
  },
  {
    id: "alert-4",
    siteId: "site-2",
    siteName: "Palais des Sports",
    bayId: "site-2-bay-2",
    bayName: "Baie 2",
    severity: "minor",
    title: "Porte ouverte détectée",
    description: "La porte de la baie est restée ouverte",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1h ago
    acknowledged: true,
    acknowledgedBy: "Technicien Martin",
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    resolved: false,
  },
  {
    id: "alert-5",
    siteId: "site-11",
    siteName: "Marché d'Intérêt National",
    severity: "critical",
    title: "Climatisation Défaillante",
    description: "Le système de climatisation ne répond plus",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 min ago
    acknowledged: false,
    resolved: false,
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
