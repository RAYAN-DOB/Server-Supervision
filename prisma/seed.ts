import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

// Ensure schema exists in the adapter-managed DB
const rawDb = new Database(dbPath);
rawDb.pragma("journal_mode = WAL");
const migrationPath = path.join(process.cwd(), "prisma", "migrations", "20260315143725_init", "migration.sql");
const migration2Path = path.join(process.cwd(), "prisma", "migrations", "20260401000000_add_inventory_models", "migration.sql");
for (const mPath of [migrationPath, migration2Path]) {
  if (fs.existsSync(mPath)) {
    const sql = fs.readFileSync(mPath, "utf-8");
    const statements = sql.split(";").filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try { rawDb.exec(stmt + ";"); } catch { /* already exists */ }
    }
  }
}
rawDb.close();

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

interface ReferenceData {
  version: string;
  sites: Array<Record<string, unknown>>;
}

async function main() {
  console.log("🌱 Début du seeding AURION...\n");

  // ── 1. Charger les sites depuis le fichier de référence ────────────────────
  const refPath = path.join(process.cwd(), "public", "data", "sites-reference.json");
  const raw = fs.readFileSync(refPath, "utf-8");
  const data: ReferenceData = JSON.parse(raw);
  const refSites = data.sites;

  console.log(`📍 ${refSites.length} sites trouvés dans le référentiel`);

  for (const ref of refSites) {
    await prisma.site.upsert({
      where: { id: ref.id as string },
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
  console.log(`  ✅ ${refSites.length} sites importés\n`);

  // ── 2. Créer les baies pour HTDV et PLDS ──────────────────────────────────
  const bayData = [
    { siteId: "HTDV", count: 5, prefix: "Baie BlackBox" },
    { siteId: "PLDS", count: 3, prefix: "Baie BlackBox" },
  ];

  let totalBays = 0;
  for (const { siteId, count, prefix } of bayData) {
    for (let i = 1; i <= count; i++) {
      await prisma.bay.upsert({
        where: { id: `${siteId}-bay-${i}` },
        update: {
          name: `${prefix} ${i}`,
          location: `Local technique — BlackBox ServSensor ${i}`,
          status: siteId === "PLDS" && i === 2 ? "warning" : "normal",
          powerConsumption: 2 + Math.random() * 3,
        },
        create: {
          id: `${siteId}-bay-${i}`,
          siteId,
          name: `${prefix} ${i}`,
          location: `Local technique — BlackBox ServSensor ${i}`,
          status: siteId === "PLDS" && i === 2 ? "warning" : "normal",
          powerConsumption: +(2 + Math.random() * 3).toFixed(2),
        },
      });
      totalBays++;
    }
  }
  console.log(`🗄️  ${totalBays} baies créées (HTDV: 5, PLDS: 3)\n`);

  // ── 3. Générer des lectures de capteurs historiques ─────────────────────────
  const sensorTypes = [
    { type: "temperature", unit: "°C", base: 22, warn: 28, crit: 35 },
    { type: "humidity", unit: "%", base: 45, warn: 65, crit: 80 },
    { type: "vibration", unit: "g", base: 0.15, warn: 0.3, crit: 0.5 },
    { type: "airflow", unit: "m³/h", base: 120, warn: 80, crit: 60 },
    { type: "pressure", unit: "hPa", base: 1013, warn: 1005, crit: 1000 },
  ];

  let totalReadings = 0;
  const now = Date.now();

  for (const { siteId, count } of bayData) {
    for (let bayIdx = 1; bayIdx <= count; bayIdx++) {
      const bayId = `${siteId}-bay-${bayIdx}`;

      for (const sensor of sensorTypes) {
        // 7 jours d'historique, 1 lecture/heure = 168 points
        for (let h = 168; h >= 0; h--) {
          const ts = new Date(now - h * 3600_000);
          const hourOfDay = ts.getHours();
          const dayVariation = Math.sin((hourOfDay / 24) * Math.PI * 2) * 1.5;
          const noise = (Math.random() - 0.5) * 0.8;
          const value = +(sensor.base + dayVariation + noise).toFixed(2);

          const status = value >= sensor.crit ? "critical" : value >= sensor.warn ? "warning" : "normal";

          await prisma.sensorReading.create({
            data: {
              siteId,
              bayId,
              type: sensor.type,
              value,
              unit: sensor.unit,
              status,
              thresholdWarn: sensor.warn,
              thresholdCrit: sensor.crit,
              timestamp: ts,
            },
          });
          totalReadings++;
        }
      }
    }
  }
  console.log(`📊 ${totalReadings} lectures de capteurs générées (7 jours d'historique)\n`);

  // ── 4. Créer des alertes ───────────────────────────────────────────────────
  const alerts = [
    {
      siteId: "PLDS",
      siteName: "Palais des Sports",
      bayId: "PLDS-bay-1",
      bayName: "Baie BlackBox 1",
      severity: "major",
      title: "Température en hausse — BlackBox ServSensor",
      description: "Le capteur BlackBox signale une montée en température anormale dans la salle technique (26.8°C > seuil 25°C)",
      status: "active",
      source: "blackbox",
      sensorType: "temperature",
      value: 26.8,
      threshold: 25,
      createdAt: new Date(now - 45 * 60_000),
    },
    {
      siteId: "PLDS",
      siteName: "Palais des Sports",
      bayId: "PLDS-bay-2",
      bayName: "Baie BlackBox 2",
      severity: "minor",
      title: "Porte baie ouverte — BlackBox ServSensor",
      description: "Le capteur de contact signale que la porte de la baie est restée ouverte depuis plus de 30 min",
      status: "acknowledged",
      source: "blackbox",
      acknowledgedBy: "Rayan DOB",
      acknowledgedAt: new Date(now - 50 * 60_000),
      createdAt: new Date(now - 60 * 60_000),
    },
    {
      siteId: "HTDV",
      siteName: "Hôtel de Ville",
      bayId: "HTDV-bay-3",
      bayName: "Baie BlackBox 3",
      severity: "info",
      title: "Rapport hebdomadaire — BlackBox ServSensor",
      description: "Tous les capteurs fonctionnent normalement. Température stable à 22.5°C. Humidité 45%. Alimentation 230V OK.",
      status: "resolved",
      source: "blackbox",
      acknowledgedBy: "Système automatique",
      acknowledgedAt: new Date(now - 119 * 60_000),
      resolvedAt: new Date(now - 119 * 60_000),
      createdAt: new Date(now - 120 * 60_000),
    },
    {
      siteId: "HTDV",
      siteName: "Hôtel de Ville",
      bayId: "HTDV-bay-1",
      bayName: "Baie BlackBox 1",
      severity: "info",
      title: "Test capteurs effectué",
      description: "Test mensuel automatique des capteurs BlackBox ServSensor Enterprise. Tous les modules répondent correctement.",
      status: "resolved",
      source: "system",
      acknowledgedBy: "Système automatique",
      acknowledgedAt: new Date(now - 24 * 3600_000 + 1000),
      resolvedAt: new Date(now - 24 * 3600_000 + 1000),
      createdAt: new Date(now - 24 * 3600_000),
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }
  console.log(`🚨 ${alerts.length} alertes créées\n`);

  // ── 5. Résumé ──────────────────────────────────────────────────────────────
  const [siteCount, bayCount, readingCount, alertCount] = await Promise.all([
    prisma.site.count(),
    prisma.bay.count(),
    prisma.sensorReading.count(),
    prisma.alert.count(),
  ]);

  console.log("═══════════════════════════════════════════════");
  console.log("  🎉 Seeding AURION terminé !");
  console.log("═══════════════════════════════════════════════");
  console.log(`  📍 Sites       : ${siteCount}`);
  console.log(`  🗄️  Baies       : ${bayCount}`);
  console.log(`  📊 Capteurs    : ${readingCount} lectures`);
  console.log(`  🚨 Alertes     : ${alertCount}`);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Erreur lors du seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
