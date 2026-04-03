/**
 * Mapping des vraies photos par site depuis aurion-sites-inventory (GitHub privé).
 * URLs servies via /api/github-media/[...path]
 */

import type { SiteMedia } from "@/types";

function ghUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `/api/github-media/${encoded}`;
}

function makePhoto(
  id: string,
  siteId: string,
  folder: string,
  filename: string,
  type: "PHOTO_LOCAL" | "PHOTO_BAY" | "ZOOM_EQUIPMENT",
  localName?: string,
  bayName?: string,
  confidence = 0.95
): SiteMedia {
  return {
    id,
    url: ghUrl(`${folder}/${filename}`),
    type,
    confidence,
    siteId,
    localId: null,
    bayId: null,
    equipmentId: null,
    createdAt: new Date().toISOString(),
    local: localName ? { id: `local-${siteId}`, name: localName } : undefined,
    bay: bayName ? { id: `bay-${siteId}`, name: bayName } : undefined,
  };
}

// ─── HTDV — Hôtel de Ville — LT-01 ──────────────────────────────────────────

const HTDV_FOLDER = "Hotel de local (HTDV)/Salle Serveurs/LT - 01";
const HTDV_FILES = [
  "IMG20250820121342.jpg",
  "IMG20250820121349.jpg",
  "IMG20250820121352.jpg",
  "IMG20250820121356.jpg",
  "IMG20250820121400.jpg",
  "IMG20250820121405.jpg",
  "IMG20250820121410.jpg",
  "IMG20250820121413.jpg",
  "IMG20250820121512.jpg",
  "IMG20250820121519.jpg",
  "IMG20250820121553.jpg",
  "IMG20250820121606.jpg",
  "IMG20250820121627.jpg",
  "IMG20250820121638.jpg",
  "IMG20250820121719.jpg",
  "IMG20250820121725.jpg",
  "IMG20250820121729.jpg",
  "IMG20250820121733.jpg",
  "IMG20250820121741.jpg",
  "IMG20250820121746.jpg",
  "IMG20250820121932.jpg",
  "IMG20250820121937.jpg",
  "IMG20250820122019.jpg",
  "IMG20250820122043.jpg",
  "IMG20250820160947.jpg",
  "IMG20250820160953.jpg",
  "IMG20250820161009.jpg",
  "IMG20250820161014.jpg",
  "IMG20250820161108.jpg",
  "IMG20250820161125.jpg",
];

// ─── PLDS — Palais des Sports — LT-04 ────────────────────────────────────────

const PLDS_FOLDER = "Palais des Sports (PLDS)/Placard sous sol/LT - 04";
const PLDS_FILES = [
  "IMG20250624175627.jpg",
  "IMG20250624175657.jpg",
  "IMG20250624175802.jpg",
  "IMG20250624175805.jpg",
  "IMG20250624175810.jpg",
  "IMG20250624175815.jpg",
  "IMG20250624175817.jpg",
  "IMG20250624175827.jpg",
  "IMG20250624175835.jpg",
  "IMG20250624175839.jpg",
  "IMG20250624175842.jpg",
  "IMG20250624175850.jpg",
  "IMG20250624175908.jpg",
  "IMG20250624175915.jpg",
  "IMG20250624175923.jpg",
  "IMG20250624175929.jpg",
  "IMG20250624175939.jpg",
  "IMG20250624175951.jpg",
  "IMG20250624175957.jpg",
  "IMG20250624180001.jpg",
  "IMG20250624180020.jpg",
  "IMG20250624180041.jpg",
  "IMG20250624180047.jpg",
  "IMG20250624180051.jpg",
  "IMG20250624180115.jpg",
  "IMG20250624180128.jpg",
  "IMG20250624180138.jpg",
  "IMG20250624180143.jpg",
  "IMG20250624180211.jpg",
  "IMG20250624180215.jpg",
  "IMG20250624180233.jpg",
  "IMG20250624180236.jpg",
  "IMG20250624180242.jpg",
  "IMG20250624180331.jpg",
  "IMG20250626135031.jpg",
  "IMG20250626135035.jpg",
  "IMG20250626135038.jpg",
  "IMG20250626135040.jpg",
  "IMG20250626135046.jpg",
  "IMG20250626135051.jpg",
  "IMG20250626135101.jpg",
  "IMG20250626135107.jpg",
  "IMG20250626135112.jpg",
  "IMG20250626135116.jpg",
  "IMG_20250923_154153.jpg",
  "IMG_20250923_154157.jpg",
  "IMG_20250923_154203.jpg",
  "IMG_20250923_154213.jpg",
  "IMG_20250923_154220.jpg",
  "IMG_20250923_154225.jpg",
  "IMG_20250923_154243.jpg",
  "IMG_20250923_154252.jpg",
  "IMG_20250923_154302.jpg",
  "IMG_20250923_154403.jpg",
  "IMG_20250923_154422.jpg",
];

// ─── NECC ─────────────────────────────────────────────────────────────────────

const NECC_ACCUEIL = "NECC/Accueil";
const NECC_ACCUEIL_FILES = [
  "IMG20250724101028.jpg", "IMG20250724101047.jpg", "IMG20250724101117.jpg",
  "IMG20250724101123.jpg", "IMG20250724101136.jpg", "IMG20250724101141.jpg",
  "IMG20250724101352.jpg", "IMG20250724102427.jpg", "IMG20250724102454.jpg",
  "IMG20250724102626.jpg", "IMG20250724102905.jpg", "IMG20250724102918.jpg",
  "IMG20250724102931.jpg", "IMG20250724102946.jpg",
];

// ─── GBTA — Gambetta ──────────────────────────────────────────────────────────

const GBTA_FOLDER = "Gambetta (GBTA)/LT - 03";
const GBTA_FILES = [
  "IMG_20250923_164135.jpg", "IMG_20250923_164146.jpg", "IMG_20250923_164150.jpg",
  "IMG_20250923_164220.jpg", "IMG_20250923_164346.jpg", "IMG_20250923_170205.jpg",
  "IMG_20250923_170208.jpg",
];

// ─── CSCL — Cuisine Centrale ─────────────────────────────────────────────────

const CSCL_FOLDER = "Cuisine Centrale (CSCL)/LT - 05";
const CSCL_FILES = [
  "IMG20250710144527.jpg", "IMG20250710144529.jpg", "IMG20250710144535.jpg",
  "IMG20250710144541.jpg", "IMG20250710144546.jpg", "IMG20250710144551.jpg",
  "IMG20250710144600.jpg", "IMG20250710144605.jpg", "IMG20250710144608.jpg",
  "IMG20250710144612.jpg", "IMG20250710144616.jpg", "IMG20250710144625.jpg",
  "IMG20250710144642.jpg", "IMG20250710144645.jpg", "IMG20250710144649.jpg",
  "IMG20250710144654.jpg", "IMG20250710144701.jpg", "IMG20250710144705.jpg",
  "IMG20250710144706.jpg", "IMG20250710144710.jpg", "IMG20250710144715.jpg",
];

// ─── RGBA — Régie Bâtiment ───────────────────────────────────────────────────

const RGBA_06 = "Régie Bâtiment (RGBA)/LT - 06";
const RGBA_07 = "Régie Bâtiment (RGBA)/Baie du fond/LT - 07";
const RGBA_08 = "Régie Bâtiment (RGBA)/Garage/LT - 08";

// ─── SDJT — Stade des Juillottes ─────────────────────────────────────────────

const SDJT_FOLDER = "Stade des Juilliotes (SDJT)/LT - 10";
const SDJT_FILES = [
  "IMG_20250730_150702.jpg", "IMG_20250730_150713.jpg", "IMG_20250730_150747.jpg",
  "IMG_20250730_150755.jpg", "IMG_20250730_150802.jpg", "IMG_20250730_150806.jpg",
  "IMG_20250730_150836.jpg", "IMG_20250730_150849.jpg", "IMG_20250730_150912.jpg",
  "IMG_20250730_150951.jpg", "IMG_20250730_151029.jpg",
];

// ─── MQAM — Médiathèque André Malraux ────────────────────────────────────────

const MQAM_FOLDER = "Médiathèques/Médiathèque André Malraux (MQAM)/LT - 11";
const MQAM_FILES = [
  "IMG_20250730_143640.jpg", "IMG_20250730_143643.jpg", "IMG_20250730_143648.jpg",
  "IMG_20250730_143652.jpg", "IMG_20250730_143656.jpg", "IMG_20250730_143718.jpg",
  "IMG_20250730_143724.jpg", "IMG_20250730_143733.jpg", "IMG_20250730_143749.jpg",
  "IMG_20250730_143820.jpg", "IMG_20250730_143834.jpg", "IMG_20250730_143904.jpg",
];

// ─── BQDC — Bibliothèque du Centre ───────────────────────────────────────────

const BQDC_FOLDER = "Médiathèques/Bibliothèque du Centre (BQDC)/LT - 12";
const BQDC_FILES = [
  "IMG_20250730_155825.jpg", "IMG_20250730_155853.jpg", "IMG_20250730_155859.jpg",
  "IMG_20250730_155903.jpg", "IMG_20250730_155915.jpg", "IMG_20250730_155936.jpg",
  "IMG_20250730_155948.jpg", "IMG_20250730_155954.jpg",
];

// ─── PCML — Police Municipale ────────────────────────────────────────────────

const PCML_LT15 = "Police Municipale (PCML)/Contrôle d'accès/LT - 15";
const PCML_LT15_FILES = [
  "IMG_20250804_140927.jpg", "IMG_20250804_140937.jpg", "IMG_20250804_140943.jpg",
  "IMG_20250804_141055.jpg", "IMG_20250804_141112.jpg", "IMG_20250804_141140.jpg",
];
const PCML_LT16 = "Police Municipale (PCML)/Salle Vidéo-Surveillance/LT - 16";
const PCML_LT16_FILES = [
  "IMG_20250804_142239.jpg", "IMG_20250804_142258.jpg", "IMG_20250804_142333.jpg",
  "IMG_20250804_142347.jpg", "IMG_20250804_142504.jpg", "IMG_20250804_142602.jpg",
  "IMG_20250804_142627.jpg", "IMG_20250804_142841.jpg",
];

// ─── OMLC — OMC ───────────────────────────────────────────────────────────────

const OMLC_LT17 = "OMC (OMLC)/Principale/LT - 17";
const OMLC_LT17_FILES = [
  "IMG_20250804_150724.jpg", "IMG_20250804_150734.jpg", "IMG_20250804_150809.jpg",
  "IMG_20250804_150824.jpg", "IMG_20250804_150832.jpg", "IMG_20250804_150846.jpg",
];
const OMLC_LT18 = "OMC (OMLC)/Infocom/LT - 18";
const OMLC_LT18_FILES = [
  "IMG_20250804_151055.jpg", "IMG_20250804_151124.jpg", "IMG_20250804_151140.jpg",
  "IMG_20250804_151151.jpg", "IMG_20250804_151204.jpg", "IMG_20250804_151222.jpg",
];

// ─── MLBL — Moulin Brûlé ─────────────────────────────────────────────────────

const MLBL_FOLDER = "Moulin Brûlé (MLBL)/LT - 19";
const MLBL_FILES = [
  "IMG_20250804_153920.jpg", "IMG_20250804_153931.jpg", "IMG_20250804_153942.jpg",
  "IMG_20250804_154139.jpg", "IMG_20250804_154147.jpg", "IMG_20250804_154154.jpg",
  "IMG_20250804_154218.jpg", "IMG_20250804_154229.jpg", "IMG_20250804_154236.jpg",
  "IMG_20250804_154305.jpg", "IMG_20250804_154313.jpg", "IMG_20250804_154605.jpg",
  "IMG_20250804_154636.jpg", "IMG_20250804_154640.jpg", "IMG_20250804_154650.jpg",
  "IMG_20250804_154656.jpg",
];

// ─── CLBT — Centre de Loisir Busteau ─────────────────────────────────────────

const CLBT_FOLDER = "Centre de Loisir Busteau (CLBT)/LT - 20";
const CLBT_FILES = [
  "IMG_20250804_160054.jpg", "IMG_20250804_160057.jpg", "IMG_20250804_160125.jpg",
  "IMG_20250804_160136.jpg", "IMG_20250804_160143.jpg",
];

// ─── MDEF — Maison de l'enfant ────────────────────────────────────────────────

const MDEF_FOLDER = "Maison de l'enfant (MDEF)/LT - 21";
const MDEF_FILES = [
  "IMG_20250804_161132.jpg", "IMG_20250804_161144.jpg", "IMG_20250804_161157.jpg",
  "IMG_20250804_161241.jpg", "IMG_20250804_161253.jpg",
];

// ─── SCDS — Service des Sports ────────────────────────────────────────────────

const SCDS_FOLDER = "Service des sports (SCDS)/LT - 22";
const SCDS_FILES = [
  "IMG_20250804_162216.jpg", "IMG_20250804_162235.jpg", "IMG_20250804_162242.jpg",
  "IMG_20250804_162331.jpg", "IMG_20250804_162333.jpg", "IMG_20250804_162457.jpg",
  "IMG_20250804_162513.jpg", "IMG_20250804_162523.jpg", "IMG_20250804_162533.jpg",
  "IMG_20250804_162539.jpg",
];

// ─── MPTA — MPT Alfort ────────────────────────────────────────────────────────

const MPTA_FOLDER = "MPT Alfort (MPTA)/LT - 26";
const MPTA_FILES = [
  "IMG_20250822_112625.jpg", "IMG_20250822_112648.jpg", "IMG_20250822_112659.jpg",
  "IMG_20250822_112719.jpg", "IMG_20250822_112737.jpg", "IMG_20250822_112802.jpg",
  "IMG_20250822_112809.jpg", "IMG_20250822_112940.jpg",
];

// ─── CTSL — Centre socioculturel liberté ─────────────────────────────────────

const CTSL_LT27 = "Centre socioculturel liberté (CTSL)/LT - 27";
const CTSL_LT27_FILES = [
  "IMG_20250822_150727.jpg", "IMG_20250822_150740.jpg", "IMG_20250822_150921.jpg",
  "IMG_20250822_150953.jpg", "IMG_20250822_151017.jpg", "IMG_20250822_151024.jpg",
  "IMG_20250822_151042.jpg", "IMG_20250822_151052.jpg", "IMG_20250822_151058.jpg",
  "IMG_20250822_151130.jpg", "IMG_20250822_151135.jpg", "IMG_20250822_151141.jpg",
  "IMG_20250822_151154.jpg", "IMG_20250822_151209.jpg", "IMG_20250822_151335.jpg",
];

// ─── SMAE — Accueil Emploi ────────────────────────────────────────────────────

const SMAE_FOLDER = "Accueil Emploi (SMAE)/LT - 29";
const SMAE_FILES = [
  "IMG_20250829_112130.jpg", "IMG_20250829_112146.jpg", "IMG_20250829_112201.jpg",
  "IMG_20250829_112219.jpg", "IMG_20250829_112239.jpg", "IMG_20250829_112246.jpg",
  "IMG_20250829_112252.jpg", "IMG_20250829_112307.jpg", "IMG_20250829_112311.jpg",
  "IMG_20250829_112326.jpg", "IMG_20250829_112331.jpg", "IMG_20250829_112359.jpg",
];

// ─── CVHD — Conservatoire Henri Dutilleux ────────────────────────────────────

const CVHD_FOLDER = "Conservatoire Henri Dutilleux (CVHD)/Provisoire/LT - 31";
const CVHD_FILES = [
  "IMG_20250901_142641.jpg", "IMG_20250901_142651.jpg", "IMG_20250901_142657.jpg",
  "IMG_20250901_142730.jpg", "IMG_20250901_142740.jpg", "IMG_20250901_142753.jpg",
];

// ─── EEPS — Ecole Pasteur ─────────────────────────────────────────────────────

const EEPS_FOLDER = "Ecole Pasteur (EEPS)/Elementaire/LT - 32";
const EEPS_FILES = ["IMG_7109.jpg", "IMG_7110.jpg"];

// ─── EESX — Ecole St Exupéry ─────────────────────────────────────────────────

const EESX_LT33 = "Ecole St Exupéry (EESX)/Elementaire/LT - 33";
const EESX_LT33_FILES = [
  "IMG_20250918_151646.jpg", "IMG_20250918_151655.jpg",
  "IMG_20250918_151704.jpg", "IMG_7100.jpg",
];

// ─── EEPN — Ecole Planètes ───────────────────────────────────────────────────

const EEPN_FOLDER = "Ecole Planètes (EEPN)/Elementaire/LT - 25";
const EEPN_FILES = [
  "IMG20250624165303.jpg", "IMG20250624165400.jpg", "IMG20250624165405.jpg",
  "IMG20250624165423.jpg", "IMG20250624165451.jpg", "IMG20260115153540.jpg",
  "IMG20260115153545.jpg", "IMG20260115153551.jpg",
];

// ─── EMGS — Ecole Maternelle George Sand ─────────────────────────────────────

const EMGS_FOLDER = "Ecole Maternlle George Sand (EMGS)";
const EMGS_FILES = [
  "IMG20250901112758.jpg", "IMG20250901112805.jpg", "IMG20250901114227.jpg",
  "IMG20250901114237.jpg", "IMG20250901114258.jpg", "IMG20250901114307.jpg",
  "IMG20250901114317.jpg", "IMG20250901114321.jpg",
];

// ─── BRLO — Bureaux logement ──────────────────────────────────────────────────

const BRLO_FOLDER = "Bureaux logement (BRLO)/LT 46";
const BRLO_FILES = [
  "IMG_8498.jpg", "IMG_8500.jpg", "IMG_8502.jpg", "IMG_8503.jpg",
  "IMG_8504.jpg", "IMG_8505.jpg", "IMG_8506.jpg", "IMG_8510.jpg",
  "IMG_8511.jpg", "IMG_8512.jpg", "IMG_8513.jpg",
];

// ─── ELCT — Espace Loisir Charentonneau ──────────────────────────────────────

const ELCT_FOLDER = "Espace Loisir de Charentonneau (ELCT)";
const ELCT_FILES = [
  "IMG_20250918_145325.jpg", "IMG_20250918_145331.jpg",
  "IMG_20250918_145435.jpg", "IMG_20250918_145443.jpg",
];

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Retourne les vraies photos depuis GitHub pour un site donné.
 * Retourne [] si le site n'a pas de photos connues.
 */
export function getRealPhotosForSite(siteId: string): SiteMedia[] {
  const entries: SiteMedia[] = [];
  let i = 0;

  const add = (
    folder: string,
    files: string[],
    type: "PHOTO_LOCAL" | "PHOTO_BAY" | "ZOOM_EQUIPMENT",
    localName?: string,
    bayName?: string
  ) => {
    files.forEach((f) => {
      entries.push(makePhoto(`${siteId}-${i++}`, siteId, folder, f, type, localName, bayName));
    });
  };

  switch (siteId) {
    case "HTDV":
      add(HTDV_FOLDER, HTDV_FILES, "PHOTO_BAY", "Salle Serveurs", "LT-01");
      break;
    case "PLDS":
      add(PLDS_FOLDER, PLDS_FILES, "PHOTO_BAY", "Placard sous sol", "LT-04");
      break;
    case "NECC":
      add(NECC_ACCUEIL, NECC_ACCUEIL_FILES, "PHOTO_LOCAL", "Accueil");
      add("NECC/LT - 13", ["IMG20250724101024.jpg"], "PHOTO_BAY", "LT-13", "LT-13");
      add("NECC/LT - 14", ["IMG20250724101742.jpg"], "PHOTO_BAY", "LT-14", "LT-14");
      break;
    case "GBTA":
      add(GBTA_FOLDER, GBTA_FILES, "PHOTO_BAY", "LT-03", "LT-03");
      break;
    case "CSCL":
      add(CSCL_FOLDER, CSCL_FILES, "PHOTO_BAY", "LT-05", "LT-05");
      break;
    case "RGBA":
      add(RGBA_06, ["IMG20250624113924.jpg", "IMG20250624113934.jpg"], "PHOTO_LOCAL", "LT-06");
      add(RGBA_07, ["IMG20250624115445.jpg","IMG20250624115503.jpg","IMG20250624115514.jpg","IMG_20250730_153135.jpg","IMG_20250730_153143.jpg","IMG_20250730_153207.jpg","IMG_20250730_153233.jpg"], "PHOTO_BAY", "Baie du fond", "LT-07");
      add(RGBA_08, ["IMG20250624113635.jpg","IMG20250624113639.jpg","IMG20250624113645.jpg","IMG20250624113656.jpg","IMG_20250730_151703.jpg"], "PHOTO_BAY", "Garage", "LT-08");
      break;
    case "SDJT":
      add(SDJT_FOLDER, SDJT_FILES, "PHOTO_BAY", "LT-10", "LT-10");
      break;
    case "MQAM":
      add(MQAM_FOLDER, MQAM_FILES, "PHOTO_BAY", "LT-11", "LT-11");
      break;
    case "BQDC":
      add(BQDC_FOLDER, BQDC_FILES, "PHOTO_BAY", "LT-12", "LT-12");
      break;
    case "PCML":
      add(PCML_LT15, PCML_LT15_FILES, "PHOTO_BAY", "Contrôle d'accès", "LT-15");
      add(PCML_LT16, PCML_LT16_FILES, "PHOTO_BAY", "Salle Vidéo-Surveillance", "LT-16");
      break;
    case "OMLC":
      add(OMLC_LT17, OMLC_LT17_FILES, "PHOTO_BAY", "Principale", "LT-17");
      add(OMLC_LT18, OMLC_LT18_FILES, "PHOTO_BAY", "Infocom", "LT-18");
      break;
    case "MLBL":
      add(MLBL_FOLDER, MLBL_FILES, "PHOTO_BAY", "LT-19", "LT-19");
      break;
    case "CLBT":
      add(CLBT_FOLDER, CLBT_FILES, "PHOTO_BAY", "LT-20", "LT-20");
      break;
    case "MDEF":
      add(MDEF_FOLDER, MDEF_FILES, "PHOTO_BAY", "LT-21", "LT-21");
      break;
    case "SCDS":
      add(SCDS_FOLDER, SCDS_FILES, "PHOTO_BAY", "LT-22", "LT-22");
      break;
    case "MPTA":
      add(MPTA_FOLDER, MPTA_FILES, "PHOTO_BAY", "LT-26", "LT-26");
      break;
    case "CTSL":
      add(CTSL_LT27, CTSL_LT27_FILES, "PHOTO_BAY", "LT-27", "LT-27");
      break;
    case "SMAE":
      add(SMAE_FOLDER, SMAE_FILES, "PHOTO_BAY", "LT-29", "LT-29");
      break;
    case "CVHD":
      add(CVHD_FOLDER, CVHD_FILES, "PHOTO_BAY", "LT-31 (Provisoire)", "LT-31");
      break;
    case "EEPS":
      add(EEPS_FOLDER, EEPS_FILES, "PHOTO_BAY", "LT-32", "LT-32");
      break;
    case "EESX":
      add(EESX_LT33, EESX_LT33_FILES, "PHOTO_BAY", "LT-33", "LT-33");
      break;
    case "EEPN":
      add(EEPN_FOLDER, EEPN_FILES, "PHOTO_BAY", "LT-25", "LT-25");
      break;
    case "EMGS":
      add(EMGS_FOLDER, EMGS_FILES, "PHOTO_LOCAL", "École Maternelle");
      break;
    case "BRLO":
      add(BRLO_FOLDER, BRLO_FILES, "PHOTO_BAY", "LT-46", "LT-46");
      break;
    case "ELCT":
      add(ELCT_FOLDER, ELCT_FILES, "PHOTO_LOCAL", "Espace Loisir");
      break;
    default:
      break;
  }

  return entries;
}

/** Tous les IDs de sites qui ont des vraies photos */
export const SITES_WITH_PHOTOS = [
  "HTDV","PLDS","NECC","GBTA","CSCL","RGBA","SDJT","MQAM","BQDC",
  "PCML","OMLC","MLBL","CLBT","MDEF","SCDS","MPTA","CTSL","SMAE",
  "CVHD","EEPS","EESX","EEPN","EMGS","BRLO","ELCT",
];
