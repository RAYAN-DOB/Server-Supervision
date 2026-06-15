/**
 * References Black Box utilisees pour conditionner l'affichage AURION.
 * Les deux sites pilotes ont une gateway unique par salle serveur.
 */

// =====================================================================
// FICHIER : lib/blackbox-refs.ts
// ROLE DANS AURION : catalogue de reference du materiel "Black Box"
//   (gateway + capteurs) installe dans les salles serveurs supervisees.
// CE QU'IL FOURNIT : les references produit (BB), leurs libelles lisibles
//   (BB_LABELS), le type de mesure de chaque capteur (BB_SENSOR_TYPES),
//   la liste des equipements par site (SITE_BB_EQUIPMENT) et 2 fonctions
//   utilitaires pour deduire quels capteurs/mesures existent sur un site.
// UTILITE : AURION s'en sert pour n'AFFICHER que les indicateurs qui
//   correspondent au materiel reellement installe (ex : ne pas montrer
//   un widget "humidite" si la salle n'a pas de capteur d'humidite).
// =====================================================================

// Dictionnaire des references produit Black Box (cle lisible -> code constructeur).
// "as const" fige les valeurs : elles deviennent des types literaux exacts.
export const BB = {
  SERVSENSOR_PLUS: "EME168A",
  TEMP_HUMIDITY: "EME1TH2-005",
  TEMP_STRING: "EME1TS",
  WATER: "WATER-DETECTOR",
  SMOKE_MODULE: "EME1S2-005",
  VOLTAGE: "EME1A1-005",
  DOOR: "EME1Y1-015",
  LCD_DISPLAY: "EME1LCD",
  MOUNT: "EMESMB",
} as const;

// Type "BBRef" = l'union de tous les codes constructeur ci-dessus.
// Garantit qu'on ne manipule que des references reellement declarees.
export type BBRef = (typeof BB)[keyof typeof BB];

// Associe chaque reference de capteur aux TYPES DE MESURE qu'il fournit.
// Sert a savoir quelles donnees (temperature, humidite...) un capteur remonte.
// Partial : toutes les refs n'ont pas de mesure (gateway, afficheur, support).
export const BB_SENSOR_TYPES: Partial<Record<BBRef, string[]>> = {
  [BB.TEMP_HUMIDITY]: ["temperature", "humidity"],
  [BB.TEMP_STRING]: ["temperature"],
  [BB.WATER]: ["water"],
  [BB.SMOKE_MODULE]: ["smoke"],
  [BB.VOLTAGE]: ["power"],
  [BB.DOOR]: ["door"],
};

// Libelles "humains" associes a chaque reference, pour l'affichage a l'ecran.
// On evite de montrer les codes constructeur bruts a l'utilisateur de la DSI.
export const BB_LABELS: Record<string, string> = {
  [BB.SERVSENSOR_PLUS]: "Black Box ServSensor Plus - gateway 1U 8 ports",
  [BB.TEMP_HUMIDITY]: "Capteur Temperature / Humidite ambiante",
  [BB.TEMP_STRING]: "Thermal Map - chaine de temperature",
  [BB.WATER]: "Detecteur de fuite d'eau - cable sol",
  [BB.SMOKE_MODULE]: "Module interface detecteur de fumee",
  [BB.VOLTAGE]: "Capteur tension secteur 230V",
  [BB.DOOR]: "Capteur securite porte - contact magnetique",
  [BB.LCD_DISPLAY]: "Afficheur LCD local deporte",
  [BB.MOUNT]: "Support de montage rack",
};

// Inventaire du materiel installe PAR SITE (cle = identifiant du site).
// Pour chaque site : une ou plusieurs gateways, chacune avec son prefixe de baie
// (bayPrefix) et la liste des references de capteurs qui y sont raccordees.
// C'est la "source de verite" pour conditionner l'affichage des capteurs.
export const SITE_BB_EQUIPMENT: Record<string, { bayPrefix: string; refs: BBRef[] }[]> = {
  HTDV: [
    {
      bayPrefix: "HTDV",
      refs: [
        BB.SERVSENSOR_PLUS,
        BB.TEMP_HUMIDITY,
        BB.TEMP_STRING,
        BB.WATER,
        BB.SMOKE_MODULE,
        BB.VOLTAGE,
        BB.DOOR,
      ],
    },
  ],
  PLDS: [
    {
      bayPrefix: "PLDS",
      refs: [
        BB.SERVSENSOR_PLUS,
        BB.TEMP_HUMIDITY,
        BB.TEMP_STRING,
        BB.WATER,
        BB.SMOKE_MODULE,
        BB.VOLTAGE,
        BB.DOOR,
      ],
    },
  ],
  "DEMO-LAB": [
    {
      bayPrefix: "LAB-01",
      refs: [
        BB.SERVSENSOR_PLUS,
        BB.TEMP_HUMIDITY,
        BB.VOLTAGE,
      ],
    },
  ],
};

// A partir d'une liste de references, renvoie l'ensemble des TYPES de mesure
// disponibles (sans doublon grace au Set), ex : ["temperature", "humidity"].
export function getSensorTypesForRefs(refs: string[]): string[] {
  const types = new Set<string>(); // Set = collection sans doublon
  for (const ref of refs) {
    // On cherche les mesures de cette ref dans la table BB_SENSOR_TYPES.
    const sensors = BB_SENSOR_TYPES[ref as BBRef];
    if (sensors) sensors.forEach((sensorType) => types.add(sensorType));
  }
  return Array.from(types); // conversion Set -> tableau pour le retour
}

// Repond a "le site X dispose-t-il d'un capteur de type Y ?".
// Utilise par l'UI pour activer/masquer un indicateur (ex : afficher la fumee).
export function hasSensorType(siteId: string, sensorType: string): boolean {
  const gateways = SITE_BB_EQUIPMENT[siteId] ?? []; // [] si site inconnu
  // "some" : vrai des qu'AU MOINS une gateway du site fournit ce type de mesure.
  return gateways.some((gateway) =>
    getSensorTypesForRefs(gateway.refs).includes(sensorType)
  );
}
