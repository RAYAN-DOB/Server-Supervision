// ============================================================================
// PredictionEntity — Entites "Prediction" et "Anomalie" (couche core/domain)
// ----------------------------------------------------------------------------
// Role : decrire les resultats de l'analyse predictive d'AURION, qui anticipe
//        les depassements de seuils (ex : "la temperature atteindra 35°C dans
//        2 jours") a partir des tendances observees dans les donnees Zabbix.
// Contient uniquement des types : la prediction et la detection d'anomalie.
// ============================================================================

// Fiabilite estimee d'une prediction (faible / moyenne / elevee).
export type PredictionConfidence = "low" | "medium" | "high";

// Prediction : projection d'une mesure dans le futur et conseil associe.
export interface Prediction {
  id: string;
  siteId: string;
  siteName: string;
  sensorType: string;
  currentValue: number;        // valeur actuelle mesuree
  predictedValue: number;      // valeur prevue dans le futur
  threshold: number;           // seuil qui risque d'etre franchi
  probability: number;         // probabilite du depassement (0 a 1)
  confidence: PredictionConfidence;
  estimatedDate: string;       // date estimee du franchissement de seuil
  trend: "rising" | "falling" | "stable"; // sens d'evolution observe
  recommendation: string;      // conseil affiche a la DSI (action a prevoir)
  createdAt: string;
}

// AnomalyDetection : signale une mesure qui sort de la plage habituelle attendue,
// meme sans atteindre un seuil d'alerte (detection d'un comportement anormal).
export interface AnomalyDetection {
  siteId: string;
  sensorType: string;
  detectedAt: string;
  currentValue: number;
  expectedRange: { min: number; max: number }; // plage consideree comme "normale"
  deviation: number;           // ecart entre la valeur reelle et la plage attendue
  severity: "low" | "medium" | "high";
}
