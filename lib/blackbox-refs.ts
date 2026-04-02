/**
 * Références exactes des produits Black Box déployés par la DSI de Maisons-Alfort.
 * Source : Inventaire PDF DSI + audit aurion-sites-inventory.
 */

// ─── Références produits ─────────────────────────────────────────────────────

export const BB = {
  // Contrôleur principal
  SERVSENSOR_PLUS: "EME1-168A",        // ServSensor Plus 1U — hub 8 capteurs

  // Capteurs environnementaux
  TEMP_HUMIDITY:   "EME1TH2-005",      // Capteur Température + Humidité
  TEMP_STRING:     "EME1TS",           // Temperature String (6 sondes)
  WATER:           "WATER-DETECTOR",   // Détecteur fuite d'eau (réf. générique)
  SMOKE_MODULE:    "EME1S2-005",       // Module interface détecteur fumée
  VOLTAGE:         "EME1A1-005",       // Capteur tension secteur (AC)
  DOOR:            "EME1Y1-015",       // Capteur sécurité porte (contact magnétique)

  // Accessoires
  LCD_DISPLAY:     "EME1LCD",          // Afficheur LCD local
  MOUNT:           "EMESMB",           // Support de montage rack
} as const;

export type BBRef = (typeof BB)[keyof typeof BB];

// ─── Mapping référence → types de capteurs exposés ───────────────────────────

export const BB_SENSOR_TYPES: Partial<Record<BBRef, string[]>> = {
  [BB.TEMP_HUMIDITY]: ["temperature", "humidity"],
  [BB.TEMP_STRING]:   ["temperature"],          // mesure multi-point
  [BB.WATER]:         ["water"],
  [BB.SMOKE_MODULE]:  ["smoke"],
  [BB.VOLTAGE]:       ["power"],
  [BB.DOOR]:          ["door"],
};

// ─── Descriptions lisibles ───────────────────────────────────────────────────

export const BB_LABELS: Record<string, string> = {
  [BB.SERVSENSOR_PLUS]: "Black Box ServSensor Plus — Contrôleur 1U (8 ports)",
  [BB.TEMP_HUMIDITY]:   "Capteur Température / Humidité ambiante",
  [BB.TEMP_STRING]:     "Temperature String — 6 sondes (cartographie thermique)",
  [BB.WATER]:           "Détecteur de fuite d'eau (câble sol)",
  [BB.SMOKE_MODULE]:    "Module interface détecteur de fumée",
  [BB.VOLTAGE]:         "Capteur tension secteur 230V",
  [BB.DOOR]:            "Capteur sécurité porte — contact magnétique 4,5 m",
  [BB.LCD_DISPLAY]:     "Afficheur LCD local déporté",
  [BB.MOUNT]:           "Support de montage rack",
};

// ─── Équipements déployés par site (source : audit DSI) ──────────────────────

/**
 * Références Black Box installées sur chaque site (HTDV, PLDS, NECC…).
 * Utilisé pour conditionner l'affichage des jauges dans l'interface AURION.
 * Si un site n'a que EME1TH2-005, seules les jauges Temp/Humidité s'affichent.
 */
export const SITE_BB_EQUIPMENT: Record<string, { bayPrefix: string; refs: BBRef[] }[]> = {
  // ── Sites avec capteurs ACTIFS ─────────────────────────────────────────────
  HTDV: [
    {
      bayPrefix: "LT-01",
      refs: [
        BB.SERVSENSOR_PLUS,
        BB.TEMP_HUMIDITY,
        BB.TEMP_STRING,
        BB.WATER,
        BB.SMOKE_MODULE,
        BB.VOLTAGE,
        BB.DOOR,
        BB.LCD_DISPLAY,
      ],
    },
  ],
  PLDS: [
    {
      bayPrefix: "LT-04",
      refs: [
        BB.SERVSENSOR_PLUS,
        BB.TEMP_HUMIDITY,
        BB.WATER,
        BB.SMOKE_MODULE,
        BB.VOLTAGE,
        BB.DOOR,
      ],
    },
  ],
  // Ajouter ici les futurs sites lors de leur mise en service
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne les types de capteurs disponibles pour un ensemble de références. */
export function getSensorTypesForRefs(refs: string[]): string[] {
  const types = new Set<string>();
  for (const ref of refs) {
    const sensors = BB_SENSOR_TYPES[ref as BBRef];
    if (sensors) sensors.forEach((t) => types.add(t));
  }
  return Array.from(types);
}

/** Indique si un type de capteur est disponible pour un site donné. */
export function hasSensorType(siteId: string, sensorType: string): boolean {
  const bays = SITE_BB_EQUIPMENT[siteId] ?? [];
  return bays.some((bay) =>
    getSensorTypesForRefs(bay.refs).includes(sensorType)
  );
}
