#!/usr/bin/env node
/**
 * generate-media-mapping.js
 * Parcourt récursivement le dépôt aurion-sites-inventory et génère
 * public/data/media-mapping.json avec les chemins d'images liés
 * aux sites et baies Prisma.
 *
 * Usage :
 *   node scripts/generate-media-mapping.js
 *   INVENTORY_DIR=/chemin/vers/inventaire node scripts/generate-media-mapping.js
 */

const fs = require("fs");
const path = require("path");

const INVENTORY_DIR =
  process.env.INVENTORY_PATH ||
  process.env.INVENTORY_DIR ||
  "/home/ubuntu/aurion-sites-inventory";

const OUTPUT_FILE = path.join(__dirname, "../public/data/media-mapping.json");

// Correspondance nom-de-dossier → ID site en base
const FOLDER_TO_SITE_ID = {
  HTDV: "HTDV", "Hotel de Ville": "HTDV", "Hôtel de Ville": "HTDV",
  PLDS: "PLDS", "Palais des Sports": "PLDS",
  PCML: "PCML", "Police Municipale": "PCML",
  RGBA: "RGBA", "Régie Bâtiment": "RGBA",
  CVHD: "CVHD", Conservatoire: "CVHD",
  MQAM: "MQAM", BQDC: "BQDC",
  NECC: "NECC",
  MPTA: "MPTA", "MPT Alfort": "MPTA",
  MDEF: "MDEF", CLBT: "CLBT",
  SDJT: "SDJT", SCDS: "SCDS",
};

// Dossiers à ignorer (non pertinents pour la prod)
const IGNORED_FOLDERS = new Set([
  "Plan DWG",
  "Deploiement BL",
  "Nouveaux locaux",
  ".git",
  ".DS_Store",
]);

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Encode un chemin relatif en URL /api/media/... */
function toMediaUrl(relPath) {
  const segments = relPath.replace(/\\/g, "/").split("/").filter(Boolean);
  return "/api/media/" + segments.map(encodeURIComponent).join("/");
}

/** Classifie le type de photo selon le nom de fichier */
function classifyType(fileName) {
  const n = fileName.toLowerCase();
  if (n.includes("zoom") || n.includes("gros") || n.includes("detail")) return "ZOOM_EQUIPMENT";
  if (n.includes("front") || n.includes("facade") || n.includes("avant")) return "PHOTO_BAY";
  if (n.includes("back") || n.includes("dos") || n.includes("arriere") || n.includes("arrière")) return "PHOTO_BAY";
  if (n.includes("overview") || n.includes("ensemble") || n.includes("vue")) return "PHOTO_LOCAL";
  if (n.includes("baie") || n.includes("bay") || n.includes("rack")) return "PHOTO_BAY";
  if (n.includes("local") || n.includes("salle") || n.includes("placard")) return "PHOTO_LOCAL";
  return "PHOTO_BAY"; // type par défaut
}

function scanDirectory(dir, siteName = null, localName = null, mapping = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    return mapping;
  }

  for (const file of entries) {
    if (file.startsWith(".") || IGNORED_FOLDERS.has(file)) continue;

    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (!siteName) {
        // Niveau 1 : nom du site
        scanDirectory(fullPath, file, null, mapping);
      } else {
        // Niveau 2+ : cherche le motif "LT - XX", "LT-XX" ou "Salle"
        const ltMatch = file.match(/LT\s*[-–]\s*\d+/i);
        const newLocalName = ltMatch ? file.trim() : localName;
        scanDirectory(fullPath, siteName, newLocalName, mapping);
      }
    } else if (stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file)) {
      if (!siteName) continue;

      const relPath = fullPath.replace(INVENTORY_DIR, "");
      const siteId = FOLDER_TO_SITE_ID[siteName] || generateSlug(siteName).toUpperCase();

      mapping.push({
        originalPath: relPath,
        url: toMediaUrl(relPath),
        siteName,
        siteId,
        siteSlug: generateSlug(siteName),
        localName: localName || "Local Principal",
        fileName: file,
        type: classifyType(file),
        confidence: 0.75,
      });
    }
  }

  return mapping;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

if (!fs.existsSync(INVENTORY_DIR)) {
  console.error(`❌ Dépôt d'inventaire introuvable : ${INVENTORY_DIR}`);
  console.error("   Définissez INVENTORY_PATH ou clonez le dépôt au bon endroit.");
  process.exit(1);
}

console.log(`📦 Scan : ${INVENTORY_DIR}`);
const mediaMapping = scanDirectory(INVENTORY_DIR);

// Créer le répertoire de sortie si nécessaire
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const output = {
  version: "1.0",
  generatedAt: new Date().toISOString(),
  inventoryPath: INVENTORY_DIR,
  count: mediaMapping.length,
  items: mediaMapping,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");

// Résumé par site
const bySite = {};
for (const item of mediaMapping) {
  bySite[item.siteId] = (bySite[item.siteId] || 0) + 1;
}
console.log("\n✅ Mapping généré :");
for (const [siteId, count] of Object.entries(bySite)) {
  console.log(`   ${siteId.padEnd(8)} : ${count} images`);
}
console.log(`\n   Total      : ${mediaMapping.length} images`);
console.log(`   Fichier    : ${OUTPUT_FILE}`);
