#!/usr/bin/env tsx
/**
 * generate-mapping.ts
 * Scanne le dépôt aurion-sites-inventory et génère un fichier mapping.json
 * décrivant la hiérarchie Site > Local > Baie > Média.
 *
 * Usage :
 *   npx tsx scripts/generate-mapping.ts
 *   npx tsx scripts/generate-mapping.ts --inventory-path ../aurion-sites-inventory
 *   npx tsx scripts/generate-mapping.ts --output data/inventory-mapping.json
 */

import * as fs from "fs";
import * as path from "path";

// ─── Configuration ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const INVENTORY_PATH = getArg("--inventory-path", path.join(process.cwd(), "..", "aurion-sites-inventory"));
const OUTPUT_PATH = getArg("--output", path.join(process.cwd(), "data", "inventory-mapping.json"));
const PUBLIC_BASE = "/inventory"; // URL base publique dans Next.js (/public/inventory/)

// ─── Correspondances codes sites ──────────────────────────────────────────────

/** Codes sites connus (dossier → ID site en base) */
const FOLDER_TO_SITE_ID: Record<string, string> = {
  HTDV: "HTDV",
  "Hotel de Ville": "HTDV",
  "Hôtel de Ville": "HTDV",
  PLDS: "PLDS",
  "Palais des Sports": "PLDS",
  PCML: "PCML",
  "Police Municipale": "PCML",
  RGBA: "RGBA",
  "Régie Bâtiment": "RGBA",
  CVHD: "CVHD",
  Conservatoire: "CVHD",
  MQAM: "MQAM",
  BQDC: "BQDC",
  NECC: "NECC",
  MPTA: "MPTA",
  "MPT Alfort": "MPTA",
  MDEF: "MDEF",
  "Maison de l'enfant": "MDEF",
  CLBT: "CLBT",
  "Centre de Loisir Busteau": "CLBT",
  SDJT: "SDJT",
  "Stade des Juilliotes": "SDJT",
  SCDS: "SCDS",
};

/** Génère un slug à partir d'un nom de site */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Extensions ───────────────────────────────────────────────────────────────

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const DOC_EXTS = new Set([".pdf", ".dwg", ".xlsx", ".docx", ".xls", ".doc"]);

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface MappingOutput {
  version: string;
  generatedAt: string;
  inventoryPath: string;
  sites: SiteMapping[];
  skippedFolders: string[];
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function readdir(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Vérifie si un nom de dossier ressemble à un local technique (LT-xx) */
function isLocalTechnique(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("lt") ||
    n.includes("local") ||
    n.includes("salle") ||
    n.includes("placard") ||
    n.includes("technique") ||
    n.includes("serveur") ||
    n.includes("baie") ||
    /lt[-\s]?\d+/i.test(name)
  );
}

/** Vérifie si un nom de dossier ressemble à une baie */
function isBayFolder(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("baie") || n.includes("bay") || /^lt[-\s]?\d+$/i.test(name);
}

/** Classifie un fichier média */
function classifyMedia(
  filePath: string,
  depth: number
): { type: MediaEntry["type"]; confidence: number } | null {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  if (DOC_EXTS.has(ext)) return { type: "PLAN_PDF", confidence: 0.95 };
  if (!IMAGE_EXTS.has(ext)) return null;

  // Heuristiques sur le nom du fichier
  if (base.includes("zoom") || base.includes("gros") || base.includes("detail")) {
    return { type: "ZOOM_EQUIPMENT", confidence: 0.9 };
  }
  if (base.includes("front") || base.includes("facade") || base.includes("avant")) {
    return { type: "PHOTO_BAY", confidence: 0.95 };
  }
  if (base.includes("back") || base.includes("dos") || base.includes("arriere") || base.includes("arrière")) {
    return { type: "PHOTO_BAY", confidence: 0.95 };
  }
  if (base.includes("overview") || base.includes("ensemble") || base.includes("vue")) {
    return { type: "PHOTO_LOCAL", confidence: 0.9 };
  }

  // Heuristique sur la profondeur dans l'arborescence
  if (depth <= 1) return { type: "PHOTO_LOCAL", confidence: 0.8 };
  if (depth === 2) return { type: "PHOTO_BAY", confidence: 0.75 };
  return { type: "ZOOM_EQUIPMENT", confidence: 0.7 };
}

/** Construit l'URL publique à partir du chemin source */
function toPublicUrl(filePath: string, inventoryRoot: string): string {
  const rel = path.relative(inventoryRoot, filePath).replace(/\\/g, "/");
  return `${PUBLIC_BASE}/${rel}`;
}

// ─── Scan récursif ────────────────────────────────────────────────────────────

/** Collecte les fichiers media d'un dossier (niveau superficiel) */
function collectMedia(
  dir: string,
  inventoryRoot: string,
  depth: number
): MediaEntry[] {
  const result: MediaEntry[] = [];
  for (const entry of readdir(dir)) {
    if (!entry.isFile()) continue;
    const filePath = path.join(dir, entry.name);
    const classified = classifyMedia(filePath, depth);
    if (!classified) continue;
    result.push({
      url: toPublicUrl(filePath, inventoryRoot),
      sourcePath: filePath,
      type: classified.type,
      confidence: classified.confidence,
    });
  }
  return result;
}

/** Scanne les sous-dossiers d'un site pour trouver Locals et Baies */
function scanSiteFolder(siteDir: string, inventoryRoot: string): { locals: LocalMapping[]; media: MediaEntry[] } {
  const locals: LocalMapping[] = [];
  const siteMedia: MediaEntry[] = [];

  for (const entry of readdir(siteDir)) {
    const fullPath = path.join(siteDir, entry.name);

    if (entry.isFile()) {
      const classified = classifyMedia(fullPath, 0);
      if (classified) {
        siteMedia.push({
          url: toPublicUrl(fullPath, inventoryRoot),
          sourcePath: fullPath,
          type: classified.type,
          confidence: classified.confidence,
        });
      }
      continue;
    }

    if (!entry.isDirectory()) continue;

    // Ignorer les dossiers non pertinents
    const lowerName = entry.name.toLowerCase();
    if (lowerName.includes("ergonomie") || lowerName.startsWith(".")) continue;

    if (isLocalTechnique(entry.name)) {
      // C'est un local technique — chercher des baies à l'intérieur
      const local: LocalMapping = {
        name: entry.name,
        folderPath: fullPath,
        bays: [],
        media: collectMedia(fullPath, inventoryRoot, 1),
      };

      // Chercher des sous-dossiers de type "baie"
      for (const subEntry of readdir(fullPath)) {
        if (!subEntry.isDirectory()) continue;
        const subPath = path.join(fullPath, subEntry.name);
        if (isBayFolder(subEntry.name)) {
          local.bays.push({
            name: subEntry.name,
            folderPath: subPath,
            media: collectMedia(subPath, inventoryRoot, 2),
          });
        }
      }

      locals.push(local);
    } else {
      // Dossier intermédiaire (ex: "Salle Serveurs") — descendre d'un niveau
      for (const subEntry of readdir(fullPath)) {
        if (!subEntry.isDirectory()) continue;
        const subPath = path.join(fullPath, subEntry.name);
        if (isLocalTechnique(subEntry.name)) {
          const local: LocalMapping = {
            name: subEntry.name,
            folderPath: subPath,
            bays: [],
            media: collectMedia(subPath, inventoryRoot, 1),
          };
          for (const bayEntry of readdir(subPath)) {
            if (!bayEntry.isDirectory()) continue;
            const bayPath = path.join(subPath, bayEntry.name);
            if (isBayFolder(bayEntry.name)) {
              local.bays.push({
                name: bayEntry.name,
                folderPath: bayPath,
                media: collectMedia(bayPath, inventoryRoot, 2),
              });
            }
          }
          locals.push(local);
        }
      }
      // Récupérer aussi les fichiers media du sous-dossier intermédiaire
      const subMedia = collectMedia(fullPath, inventoryRoot, 1);
      siteMedia.push(...subMedia);
    }
  }

  return { locals, media: siteMedia };
}

// ─── Point d'entrée ───────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`❌ Dépôt d'inventaire introuvable : ${INVENTORY_PATH}`);
    console.error("   Utilisez --inventory-path <chemin> pour spécifier le chemin.");
    process.exit(1);
  }

  console.log(`📦 Scan du dépôt : ${INVENTORY_PATH}`);

  const sites: SiteMapping[] = [];
  const skippedFolders: string[] = [];

  for (const entry of readdir(INVENTORY_PATH)) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const siteId = FOLDER_TO_SITE_ID[entry.name];
    if (!siteId) {
      skippedFolders.push(entry.name);
      console.warn(`  ⚠️  Dossier non reconnu (ignoré) : ${entry.name}`);
      continue;
    }

    const siteDir = path.join(INVENTORY_PATH, entry.name);
    console.log(`  📍 Site : ${entry.name} → ${siteId}`);

    const { locals, media } = scanSiteFolder(siteDir, INVENTORY_PATH);
    const totalMedia = media.length + locals.reduce((s, l) => s + l.media.length + l.bays.reduce((b, bay) => b + bay.media.length, 0), 0);
    console.log(`     ${locals.length} locaux, ${totalMedia} fichiers média`);

    sites.push({
      siteId,
      slug: toSlug(siteId),
      folderName: entry.name,
      locals,
      media,
    });
  }

  const output: MappingOutput = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    inventoryPath: INVENTORY_PATH,
    sites,
    skippedFolders,
  };

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✅ Mapping généré : ${OUTPUT_PATH}`);
  console.log(`   ${sites.length} sites mappés, ${skippedFolders.length} dossiers ignorés`);
}

main();
