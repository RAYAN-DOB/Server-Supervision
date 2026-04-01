/**
 * seed-inventory.ts
 * Lit data/inventory-mapping.json et peuple la base de données avec :
 *  - Mise à jour slug / inventoryStatus sur les Sites existants
 *  - Création des Locaux techniques (Local)
 *  - Association des Baies existantes aux Locaux (Bay.localId)
 *  - Création des entrées Média (Media)
 *
 * Usage :
 *   npx tsx prisma/seed-inventory.ts
 *   npx tsx prisma/seed-inventory.ts --mapping data/inventory-mapping.json
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

// ─── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}
const MAPPING_PATH = getArg("--mapping", path.join(process.cwd(), "data", "inventory-mapping.json"));

// ─── Prisma setup (même pattern que seed.ts) ──────────────────────────────────
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const rawDb = new Database(dbPath);
rawDb.pragma("journal_mode = WAL");

// Appliquer les deux migrations si nécessaire
for (const migName of ["20260315143725_init", "20260401000000_add_inventory_models"]) {
  const mPath = path.join(process.cwd(), "prisma", "migrations", migName, "migration.sql");
  if (fs.existsSync(mPath)) {
    const sql = fs.readFileSync(mPath, "utf-8");
    const statements = sql.split(";").filter((s) => s.trim().length > 0);
    for (const stmt of statements) {
      try { rawDb.exec(stmt + ";"); } catch { /* already applied */ }
    }
  }
}
rawDb.close();

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

// ─── Types mapping ─────────────────────────────────────────────────────────────
interface MediaEntry {
  url: string;
  sourcePath: string;
  type: "PHOTO_LOCAL" | "PHOTO_BAY" | "ZOOM_EQUIPMENT" | "PLAN_PDF";
  confidence: number;
}

interface BayMapping {
  name: string;
  folderPath: string;
  media: MediaEntry[];
}

interface LocalMapping {
  name: string;
  folderPath: string;
  bays: BayMapping[];
  media: MediaEntry[];
}

interface SiteMapping {
  siteId: string;
  slug: string;
  folderName: string;
  locals: LocalMapping[];
  media: MediaEntry[];
}

interface MappingFile {
  version: string;
  generatedAt: string;
  sites: SiteMapping[];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(MAPPING_PATH)) {
    console.error(`❌ Fichier mapping introuvable : ${MAPPING_PATH}`);
    console.error("   Exécutez d'abord : npx tsx scripts/generate-mapping.ts");
    process.exit(1);
  }

  const mapping: MappingFile = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf-8"));
  console.log(`🗺️  Lecture du mapping v${mapping.version} (${mapping.generatedAt})`);
  console.log(`   ${mapping.sites.length} sites à importer\n`);

  let totalLocals = 0;
  let totalMedia = 0;
  let totalBaysLinked = 0;

  for (const siteMap of mapping.sites) {
    const { siteId, slug, locals, media: siteMedia } = siteMap;

    // ── 1. Vérifier que le site existe en base ─────────────────────────────
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      console.warn(`  ⚠️  Site ${siteId} introuvable en base (ignoré)`);
      continue;
    }

    console.log(`  📍 ${site.name} (${siteId})`);

    // ── 2. Mettre à jour slug et inventoryStatus ───────────────────────────
    await prisma.site.update({
      where: { id: siteId },
      data: {
        slug: slug || null,
        inventoryStatus: site.blackboxInstalled ? "active" : "planned",
      },
    });

    // ── 3. Créer les médias du site (niveau racine) ────────────────────────
    for (const m of siteMedia) {
      await prisma.media.create({
        data: { url: m.url, type: m.type, confidence: m.confidence, siteId },
      });
      totalMedia++;
    }

    // ── 4. Créer les Locaux et leurs médias ───────────────────────────────
    for (const localMap of locals) {
      const local = await prisma.local.create({
        data: { siteId, name: localMap.name },
      });
      totalLocals++;
      console.log(`     Local : ${localMap.name} (${localMap.media.length} médias)`);

      for (const m of localMap.media) {
        await prisma.media.create({
          data: { url: m.url, type: m.type, confidence: m.confidence, siteId, localId: local.id },
        });
        totalMedia++;
      }

      // ── 5. Baies associées au local ──────────────────────────────────────
      for (const bayMap of localMap.bays) {
        // Chercher une baie existante par nom (correspondance approximative)
        const existingBay = await prisma.bay.findFirst({
          where: {
            siteId,
            name: { contains: bayMap.name.replace(/^LT[-\s]?/i, "").trim() },
          },
        });

        let bayId: string;
        if (existingBay) {
          // Mettre à jour avec localId
          await prisma.bay.update({
            where: { id: existingBay.id },
            data: { localId: local.id },
          });
          bayId = existingBay.id;
          totalBaysLinked++;
        } else {
          // Créer une nouvelle baie
          const newBay = await prisma.bay.create({
            data: { siteId, localId: local.id, name: bayMap.name, location: localMap.name },
          });
          bayId = newBay.id;
        }

        for (const m of bayMap.media) {
          await prisma.media.create({
            data: { url: m.url, type: m.type, confidence: m.confidence, siteId, localId: local.id, bayId },
          });
          totalMedia++;
        }
      }
    }
  }

  // ── Résumé ─────────────────────────────────────────────────────────────────
  const [mediaCount, localCount] = await Promise.all([
    prisma.media.count(),
    prisma.local.count(),
  ]);

  console.log("\n═══════════════════════════════════════════════");
  console.log("  ✅ Import inventaire terminé !");
  console.log("═══════════════════════════════════════════════");
  console.log(`  🏛️  Locaux créés   : ${totalLocals} (total DB : ${localCount})`);
  console.log(`  🔗 Baies liées     : ${totalBaysLinked}`);
  console.log(`  🖼️  Médias créés    : ${totalMedia} (total DB : ${mediaCount})`);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Erreur lors du seeding inventaire:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
