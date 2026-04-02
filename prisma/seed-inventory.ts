/**
 * seed-inventory.ts
 * Lit le fichier de mapping d'inventaire et peuple la base de données :
 *  - Mise à jour slug / inventoryStatus sur les Sites existants
 *  - Création des Locaux techniques (Local)
 *  - Association des Baies existantes aux Locaux (Bay.localId)
 *  - Création des entrées Média (Media)
 *  - Création des équipements Black Box avec modelReference
 *
 * Lit en priorité public/data/media-mapping.json (généré par generate-media-mapping.js)
 * puis data/inventory-mapping.json (généré par generate-mapping.ts) en fallback.
 *
 * Usage :
 *   npx tsx prisma/seed-inventory.ts
 *   npx tsx prisma/seed-inventory.ts --mapping public/data/media-mapping.json
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { SITE_BB_EQUIPMENT, BB_LABELS } from "../lib/blackbox-refs";

// ─── Args ─────────────────────────────────────────────────────────────────────
const cliArgs = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = cliArgs.indexOf(name);
  return idx !== -1 && cliArgs[idx + 1] ? cliArgs[idx + 1] : fallback;
}

// Chercher le fichier de mapping dans l'ordre de priorité
function findMappingFile(): string {
  const explicit = cliArgs.find((a, i) => cliArgs[i - 1] === "--mapping");
  if (explicit) return explicit;
  const candidates = [
    path.join(process.cwd(), "public", "data", "media-mapping.json"),
    path.join(process.cwd(), "data", "inventory-mapping.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]; // will fail with nice message below
}

const MAPPING_PATH = findMappingFile();

// ─── Prisma setup ─────────────────────────────────────────────────────────────
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const rawDb = new Database(dbPath);
rawDb.pragma("journal_mode = WAL");

for (const migName of [
  "20260315143725_init",
  "20260401000000_add_inventory_models",
  "20260401000001_add_equipment_model_ref",
]) {
  const mPath = path.join(process.cwd(), "prisma", "migrations", migName, "migration.sql");
  if (fs.existsSync(mPath)) {
    const sql = fs.readFileSync(mPath, "utf-8");
    const stmts = sql.split(";").filter((s) => s.trim().length > 0);
    for (const stmt of stmts) {
      try { rawDb.exec(stmt + ";"); } catch { /* already applied */ }
    }
  }
}
rawDb.close();

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  originalPath: string;
  url: string;
  siteId: string;
  localName: string;
  type: "PHOTO_LOCAL" | "PHOTO_BAY" | "ZOOM_EQUIPMENT" | "PLAN_PDF";
  confidence: number;
}

// Format "media-mapping.json" (nouveau — JS script)
interface NewMappingFile {
  version: string;
  items: MediaItem[];
}

// Format "inventory-mapping.json" (ancien — TS script)
interface OldLocalMapping {
  name: string;
  bays: Array<{ name: string; media: Array<{ url: string; type: string; confidence: number }> }>;
  media: Array<{ url: string; type: string; confidence: number }>;
}
interface OldSiteMapping {
  siteId: string;
  slug: string;
  locals: OldLocalMapping[];
  media: Array<{ url: string; type: string; confidence: number }>;
}
interface OldMappingFile {
  sites: OldSiteMapping[];
}

// ─── Normalise les deux formats en une liste plate d'items ───────────────────

interface NormalizedItem {
  siteId: string;
  localName: string;
  url: string;
  type: string;
  confidence: number;
}

function normalizeMappingFile(filePath: string): { sites: Map<string, { slug: string; items: NormalizedItem[] }>; rawData: unknown } {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const result = new Map<string, { slug: string; items: NormalizedItem[] }>();

  if (Array.isArray((raw as NewMappingFile).items)) {
    // Nouveau format (generate-media-mapping.js)
    const data = raw as NewMappingFile;
    for (const item of data.items) {
      if (!result.has(item.siteId)) {
        result.set(item.siteId, { slug: item.siteId.toLowerCase(), items: [] });
      }
      result.get(item.siteId)!.items.push({
        siteId: item.siteId,
        localName: item.localName,
        url: item.url,
        type: item.type,
        confidence: item.confidence,
      });
    }
  } else if (Array.isArray((raw as OldMappingFile).sites)) {
    // Ancien format (generate-mapping.ts)
    const data = raw as OldMappingFile;
    for (const site of data.sites) {
      if (!result.has(site.siteId)) {
        result.set(site.siteId, { slug: site.slug, items: [] });
      }
      const entry = result.get(site.siteId)!;
      for (const m of site.media) {
        entry.items.push({ siteId: site.siteId, localName: "Principal", url: m.url, type: m.type, confidence: m.confidence });
      }
      for (const local of site.locals) {
        for (const m of local.media) {
          entry.items.push({ siteId: site.siteId, localName: local.name, url: m.url, type: m.type, confidence: m.confidence });
        }
        for (const bay of local.bays) {
          for (const m of bay.media) {
            entry.items.push({ siteId: site.siteId, localName: local.name, url: m.url, type: m.type, confidence: m.confidence });
          }
        }
      }
    }
  }

  return { sites: result, rawData: raw };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(MAPPING_PATH)) {
    console.error(`❌ Fichier mapping introuvable : ${MAPPING_PATH}`);
    console.error("   Exécutez d'abord :");
    console.error("   node scripts/generate-media-mapping.js");
    process.exit(1);
  }

  console.log(`🗺️  Lecture du mapping : ${MAPPING_PATH}`);
  const { sites: siteMap } = normalizeMappingFile(MAPPING_PATH);
  console.log(`   ${siteMap.size} sites dans le mapping\n`);

  let totalLocals = 0;
  let totalMedia = 0;
  let totalEquipments = 0;
  let totalBaysLinked = 0;

  // ── Médias du mapping ──────────────────────────────────────────────────────
  for (const [siteId, { slug, items }] of siteMap) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      console.warn(`  ⚠️  Site ${siteId} introuvable en base (ignoré)`);
      continue;
    }

    console.log(`  📍 ${site.name} (${siteId}) — ${items.length} médias`);

    // Mettre à jour slug et inventoryStatus
    await prisma.site.update({
      where: { id: siteId },
      data: {
        slug: slug || siteId.toLowerCase(),
        inventoryStatus: site.blackboxInstalled ? "active" : "planned",
      },
    });

    // Regrouper les items par localName
    const byLocal = new Map<string, NormalizedItem[]>();
    for (const item of items) {
      const key = item.localName || "Local Principal";
      if (!byLocal.has(key)) byLocal.set(key, []);
      byLocal.get(key)!.push(item);
    }

    for (const [localName, localItems] of byLocal) {
      // Créer le local s'il n'existe pas déjà
      let local = await prisma.local.findFirst({
        where: { siteId, name: localName },
      });
      if (!local) {
        local = await prisma.local.create({ data: { siteId, name: localName } });
        totalLocals++;
      }

      for (const item of localItems) {
        // Éviter les doublons URL
        const exists = await prisma.media.findFirst({ where: { siteId, url: item.url } });
        if (exists) continue;

        await prisma.media.create({
          data: {
            url: item.url,
            type: item.type,
            confidence: item.confidence,
            siteId,
            localId: local.id,
          },
        });
        totalMedia++;
      }
    }
  }

  console.log("");

  // ── Équipements Black Box (données figées de l'audit DSI) ─────────────────
  console.log("🔧 Création des équipements Black Box...");

  for (const [siteId, bayConfigs] of Object.entries(SITE_BB_EQUIPMENT)) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) continue;

    for (const bayConfig of bayConfigs) {
      // Trouver ou créer la baie
      let bay = await prisma.bay.findFirst({
        where: { siteId, name: { contains: bayConfig.bayPrefix } },
      });
      if (!bay) {
        bay = await prisma.bay.create({
          data: { siteId, name: bayConfig.bayPrefix, location: bayConfig.bayPrefix },
        });
      }

      for (const ref of bayConfig.refs) {
        // Éviter les doublons
        const exists = await prisma.equipment.findFirst({
          where: { bayId: bay.id, modelReference: ref },
        });
        if (exists) continue;

        await prisma.equipment.create({
          data: {
            bayId: bay.id,
            name: BB_LABELS[ref] ?? ref,
            modelReference: ref,
            type: ref.startsWith("EME1-168") ? "SENSOR_HUB" : "SENSOR",
          },
        });
        totalEquipments++;
      }
    }
  }

  // ── Résumé ─────────────────────────────────────────────────────────────────
  const [mediaCount, localCount, equipCount] = await Promise.all([
    prisma.media.count(),
    prisma.local.count(),
    prisma.equipment.count(),
  ]);

  console.log("\n═══════════════════════════════════════════════");
  console.log("  ✅ Import inventaire terminé !");
  console.log("═══════════════════════════════════════════════");
  console.log(`  🏛️  Locaux créés    : ${totalLocals} (total DB : ${localCount})`);
  console.log(`  🖼️  Médias créés    : ${totalMedia} (total DB : ${mediaCount})`);
  console.log(`  🔧 Équipements BB  : ${totalEquipments} (total DB : ${equipCount})`);
  console.log(`  🔗 Baies liées     : ${totalBaysLinked}`);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Erreur lors du seeding inventaire:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
