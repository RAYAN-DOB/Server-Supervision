// =====================================================================
// FICHIER : prisma/seed.ts
// ROLE DANS AURION : script d'amorcage ("seed") de la base locale.
//   Il REMPLIT la base SQLite avec des donnees de demonstration pour que
//   l'app soit utilisable/demontrable sans connexion Zabbix reelle.
// CE QU'IL FAIT : 1) importe le referentiel des sites depuis le JSON,
//   2) genere des baies + un historique de mesures (72h) pour les 2 sites
//   pilotes, 3) cree quelques alertes d'exemple.
// CE QU'IL PRODUIT : tables Site / Bay / SensorReading / Alert peuplees.
// IMPORTANT : ne s'execute qu'a la demande (commande de seed), pas a chaque
//   lancement de l'app. Les donnees generees sont SIMULEES (mock).
// =====================================================================

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

// Chemin du fichier base SQLite local.
const dbPath = path.join(process.cwd(), "prisma", "dev.db");

// On ouvre d'abord une connexion brute pour garantir que les tables existent
// (le seed peut etre lance sur une base vierge avant tout demarrage de l'app).
const rawDb = new Database(dbPath);
rawDb.pragma("journal_mode = WAL"); // mode WAL pour de meilleures perfs

// Liste des migrations SQL a rejouer pour creer le schema.
const migrationPaths = [
  path.join(process.cwd(), "prisma", "migrations", "20260315143725_init", "migration.sql"),
  path.join(process.cwd(), "prisma", "migrations", "20260401000000_add_inventory_models", "migration.sql"),
];

// Pour chaque migration : on lit le SQL et on execute chaque instruction.
for (const migrationPath of migrationPaths) {
  if (!fs.existsSync(migrationPath)) continue;

  const sql = fs.readFileSync(migrationPath, "utf-8");
  // Decoupage du fichier en instructions individuelles (separateur ";").
  for (const statement of sql.split(";").filter((s) => s.trim().length > 0)) {
    try {
      rawDb.exec(`${statement};`);
    } catch {
      // Tables or indexes may already exist in a local developer database.
      // (On ignore l'erreur : le schema est peut-etre deja en place.)
    }
  }
}
rawDb.close(); // on referme la connexion brute, Prisma prend le relais ensuite

// Client Prisma utilise pour toutes les ecritures de donnees de demonstration.
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

// Forme attendue du fichier sites-reference.json (version + tableau de sites).
interface ReferenceData {
  version: string;
  sites: Array<Record<string, unknown>>;
}

// Les 2 sites pilotes reellement supervises + leurs valeurs de base servant
// a simuler des mesures realistes (temperature, humidite, nb de baies...).
const PILOT_SITES = [
  {
    siteId: "HTDV",
    siteName: "Hotel de Ville",
    bayCount: 4,
    baseTemp: 22.5,
    baseHumidity: 45,
    powerW: 12,
    status: "normal",
  },
  {
    siteId: "PLDS",
    siteName: "Palais des Sports",
    bayCount: 2,
    baseTemp: 23.2,
    baseHumidity: 48,
    powerW: 8,
    status: "warning",
  },
] as const;

// Types de capteurs simules, avec leur unite et leurs seuils d'alerte
// (warn = avertissement, crit = critique). Reproduit le materiel Black Box.
const SENSOR_TYPES = [
  { type: "temperature", unit: "C", warn: 27, crit: 30 },
  { type: "humidity", unit: "%", warn: 60, crit: 75 },
  { type: "smoke", unit: "state", warn: 1, crit: 1 },   // capteurs "etat" : 0/1
  { type: "water", unit: "state", warn: 1, crit: 1 },
  { type: "door", unit: "state", warn: 1, crit: 1 },
  { type: "power", unit: "state", warn: 0, crit: 0 },
] as const;

// Importe TOUS les sites du referentiel JSON dans la table Site.
// Utilise "upsert" : met a jour si le site existe deja, sinon le cree.
async function importReferenceSites() {
  const refPath = path.join(process.cwd(), "public", "data", "sites-reference.json");
  const raw = fs.readFileSync(refPath, "utf-8");
  const data: ReferenceData = JSON.parse(raw); // parse du JSON en objet

  for (const ref of data.sites) {
    // upsert = UPDATE si la cle existe, sinon INSERT (creation).
    // Les "?? valeur" fournissent des valeurs par defaut si le JSON est incomplet.
    await prisma.site.upsert({
      where: { id: ref.id as string }, // recherche par identifiant de site
      // Champs appliques si le site existe deja (mise a jour).
      update: {
        name: ref.name as string,
        aliases: JSON.stringify(ref.aliases ?? []),
        address: (ref.address as string) ?? null,
        postalCode: (ref.postalCode as string) ?? "94700",
        city: (ref.city as string) ?? "Maisons-Alfort",
        lat: ref.lat != null ? Number(ref.lat) : null,
        lng: ref.lng != null ? Number(ref.lng) : null,
        addressStatus: (ref.addressStatus as string) ?? "needs_manual_validation",
        ltNames: JSON.stringify(ref.ltNames ?? []),
        ltCount: Number(ref.ltCount ?? (ref.ltNames as string[])?.length ?? 0),
        telephonyEquipment: (ref.telephonyEquipment as string) ?? null,
        likelyManagedByDSI: Boolean(ref.likelyManagedByDSI),
        category: (ref.category as string) ?? null,
        zabbixStatus: (ref.zabbixStatus as string) ?? "not_connected",
        sensorsStatus: (ref.sensorsStatus as string) ?? "none",
        zabbixEnabled: Boolean(ref.zabbixEnabled),
        zabbixHostId: (ref.zabbixHostId as string) ?? null,
        zabbixHostName: (ref.zabbixHostName as string) ?? null,
        zabbixTemplate: (ref.zabbixTemplate as string) ?? null,
        zabbixError: (ref.zabbixError as string) ?? null,
        visibleOnMap: ref.visibleOnMap !== false,
        notes: (ref.notes as string) ?? null,
        source: (ref.source as string) ?? "referentiel-json",
        blackboxInstalled: Boolean(ref.blackboxInstalled),
        blackboxModel: (ref.blackboxModel as string) ?? null,
        blackboxSerial: (ref.blackboxSerial as string) ?? null,
        blackboxFirmware: (ref.blackboxFirmware as string) ?? null,
        blackboxInstalledAt: ref.blackboxInstalledAt ? new Date(ref.blackboxInstalledAt as string) : null,
        blackboxInstalledBy: (ref.blackboxInstalledBy as string) ?? null,
        blackboxBayCount: ref.blackboxBayCount != null ? Number(ref.blackboxBayCount) : null,
      },
      // Champs utilises si le site n'existe pas encore (creation).
      create: {
        id: ref.id as string,
        name: ref.name as string,
        aliases: JSON.stringify(ref.aliases ?? []),
        address: (ref.address as string) ?? null,
        postalCode: (ref.postalCode as string) ?? "94700",
        city: (ref.city as string) ?? "Maisons-Alfort",
        lat: ref.lat != null ? Number(ref.lat) : null,
        lng: ref.lng != null ? Number(ref.lng) : null,
        addressStatus: (ref.addressStatus as string) ?? "needs_manual_validation",
        ltNames: JSON.stringify(ref.ltNames ?? []),
        ltCount: Number(ref.ltCount ?? (ref.ltNames as string[])?.length ?? 0),
        telephonyEquipment: (ref.telephonyEquipment as string) ?? null,
        likelyManagedByDSI: Boolean(ref.likelyManagedByDSI),
        category: (ref.category as string) ?? null,
        zabbixStatus: (ref.zabbixStatus as string) ?? "not_connected",
        sensorsStatus: (ref.sensorsStatus as string) ?? "none",
        zabbixEnabled: Boolean(ref.zabbixEnabled),
        zabbixHostId: (ref.zabbixHostId as string) ?? null,
        zabbixHostName: (ref.zabbixHostName as string) ?? null,
        zabbixTemplate: (ref.zabbixTemplate as string) ?? null,
        zabbixError: (ref.zabbixError as string) ?? null,
        visibleOnMap: ref.visibleOnMap !== false,
        notes: (ref.notes as string) ?? null,
        source: (ref.source as string) ?? "referentiel-json",
        blackboxInstalled: Boolean(ref.blackboxInstalled),
        blackboxModel: (ref.blackboxModel as string) ?? null,
        blackboxSerial: (ref.blackboxSerial as string) ?? null,
        blackboxFirmware: (ref.blackboxFirmware as string) ?? null,
        blackboxInstalledAt: ref.blackboxInstalledAt ? new Date(ref.blackboxInstalledAt as string) : null,
        blackboxInstalledBy: (ref.blackboxInstalledBy as string) ?? null,
        blackboxBayCount: ref.blackboxBayCount != null ? Number(ref.blackboxBayCount) : null,
      },
    });
  }

  return data.sites.length; // nombre de sites importes
}

// Calcule une valeur de capteur SIMULEE pour un instant donne.
// Les fonctions sin/cos creent une ondulation realiste autour d'une valeur de base
// (la mesure varie legerement d'heure en heure et selon la baie).
function sensorValue(type: string, site: (typeof PILOT_SITES)[number], bayIndex: number, hourIndex: number) {
  if (type === "temperature") {
    const variation = Math.sin(hourIndex / 8) * 0.6; // oscillation +/- 0.6°C
    // baseTemp + petit ecart par baie + variation, arrondi a 1 decimale.
    return +(site.baseTemp + bayIndex * 0.2 + variation).toFixed(1);
  }

  if (type === "humidity") {
    const variation = Math.cos(hourIndex / 9) * 1.5; // oscillation +/- 1.5 %
    return +(site.baseHumidity + bayIndex + variation).toFixed(0);
  }

  if (type === "power") return 1; // alimentation presente = 1
  return 0; // autres etats (fumee/eau/porte) au repos = 0
}

// Cree les baies des sites pilotes et un historique de mesures sur 72h.
async function seedPilotBaysAndSensors() {
  // On repart de zero : suppression des anciennes baies/mesures des sites pilotes
  // pour eviter les doublons si le seed est relance ("in" = liste d'ids).
  await prisma.bay.deleteMany({
    where: { siteId: { in: PILOT_SITES.map((site) => site.siteId) } },
  });
  await prisma.sensorReading.deleteMany({
    where: { siteId: { in: PILOT_SITES.map((site) => site.siteId) } },
  });

  const now = Date.now(); // instant de reference pour horodater les mesures
  let totalBays = 0;       // compteurs pour le bilan final
  let totalReadings = 0;

  // Boucle sur chaque site pilote, puis sur chacune de ses baies.
  for (const site of PILOT_SITES) {
    for (let bayIndex = 1; bayIndex <= site.bayCount; bayIndex++) {
      const bayId = `${site.siteId}-bay-${bayIndex}`; // id unique de la baie

      await prisma.bay.create({
        data: {
          id: bayId,
          siteId: site.siteId,
          name: `Baie ${site.siteId} ${bayIndex}`,
          location: `${site.siteName} - gateway EME168A unique`,
          status: site.status,
          powerConsumption: site.powerW,
        },
      });
      totalBays++;

      // Pour chaque type de capteur, on genere 73 mesures (de h=72 a h=0),
      // soit une mesure par heure sur les 3 derniers jours.
      for (const sensor of SENSOR_TYPES) {
        for (let h = 72; h >= 0; h--) {
          // Horodatage = maintenant - h heures (3600_000 ms = 1 heure).
          const timestamp = new Date(now - h * 3600_000);
          const value = sensorValue(sensor.type, site, bayIndex - 1, h);
          // Calcul du statut en comparant la valeur aux seuils warn/crit.
          // Seuls temperature et humidite declenchent warning/critical ici.
          const status =
            sensor.type === "temperature" && value >= sensor.crit ? "critical" :
            sensor.type === "temperature" && value >= sensor.warn ? "warning" :
            sensor.type === "humidity" && value >= sensor.crit ? "critical" :
            sensor.type === "humidity" && value >= sensor.warn ? "warning" :
            "normal";

          await prisma.sensorReading.create({
            data: {
              siteId: site.siteId,
              bayId,
              type: sensor.type,
              value,
              unit: sensor.unit,
              status,
              thresholdWarn: sensor.warn,
              thresholdCrit: sensor.crit,
              timestamp,
            },
          });
          totalReadings++;
        }
      }
    }
  }

  return { totalBays, totalReadings }; // bilan pour l'affichage console
}

// Cree quelques alertes d'exemple pour les sites pilotes (etat "resolved").
async function seedPilotAlerts() {
  // On purge d'abord les alertes existantes des sites pilotes.
  await prisma.alert.deleteMany({
    where: { siteId: { in: PILOT_SITES.map((site) => site.siteId) } },
  });

  const now = Date.now();
  // Deux alertes de demonstration deja resolues, horodatees dans le passe recent.
  const alerts = [
    {
      siteId: "HTDV",
      siteName: "Hotel de Ville",
      bayId: "HTDV-bay-1",
      bayName: "Baie HTDV 1",
      severity: "info",
      title: "Supervision HTDV operationnelle",
      description: "Gateway BLACKBOX-HTDV, capteur temperature/humidite, thermal map, eau, fumee, porte et alimentation references pour Zabbix.",
      status: "resolved",
      source: "blackbox",
      sensorType: "temperature",
      acknowledgedBy: "Systeme AURION",
      acknowledgedAt: new Date(now - 60 * 60_000),
      resolvedAt: new Date(now - 60 * 60_000),
      createdAt: new Date(now - 65 * 60_000),
    },
    {
      siteId: "PLDS",
      siteName: "Palais des Sports",
      bayId: "PLDS-bay-1",
      bayName: "Baie PLDS 1",
      severity: "info",
      title: "Preparation raccordement PLDS",
      description: "Gateway BLACKBOX-PLDS referencee. Validation restante : port switch VLAN DSI, flux Stormshield et collecte SNMPv3 depuis Zabbix.",
      status: "resolved",
      source: "system",
      sensorType: "snmp",
      acknowledgedBy: "Rayan DOB",
      acknowledgedAt: new Date(now - 40 * 60_000),
      resolvedAt: new Date(now - 40 * 60_000),
      createdAt: new Date(now - 45 * 60_000),
    },
  ];

  // Insertion de chaque alerte une par une.
  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }

  return alerts.length;
}

// Point d'entree du script : enchaine les 3 etapes d'amorcage puis fait un bilan.
async function main() {
  console.log("AURION seed - start");

  // Etapes executees dans l'ordre (await = on attend chaque fin avant la suivante).
  const importedSites = await importReferenceSites();
  const { totalBays, totalReadings } = await seedPilotBaysAndSensors();
  const totalAlerts = await seedPilotAlerts();

  // Promise.all : on lance les 4 comptages en parallele pour le bilan final.
  const [siteCount, bayCount, readingCount, alertCount] = await Promise.all([
    prisma.site.count(),
    prisma.bay.count(),
    prisma.sensorReading.count(),
    prisma.alert.count(),
  ]);

  console.log(`Sites imported: ${importedSites}`);
  console.log(`Pilot bays: ${totalBays} (HTDV: 4, PLDS: 2)`);
  console.log(`Pilot sensor readings: ${totalReadings}`);
  console.log(`Pilot alerts: ${totalAlerts}`);
  console.log(`Database totals: ${siteCount} sites, ${bayCount} bays, ${readingCount} readings, ${alertCount} alerts`);
  console.log("AURION seed - done");
}

// Execution du script : on ferme proprement la connexion en cas de succes,
// et en cas d'erreur on l'affiche, on deconnecte et on sort en code 1 (echec).
main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1); // code de sortie non nul = signale l'echec au terminal
  });
