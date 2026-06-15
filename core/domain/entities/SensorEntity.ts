// ============================================================================
// SensorEntity — Entites liees aux CAPTEURS et aux BAIES (couche core/domain)
// ----------------------------------------------------------------------------
// Role : decrire les mesures physiques d'une salle serveur (temperature,
//        humidite, fumee, etc.) telles qu'AURION les lit depuis Zabbix.
// Contient : le type d'un capteur, une mesure instantanee (SensorReading),
//            l'historique d'un capteur (SensorHistory) et une baie (BayEntity).
// Ce fichier ne definit que des types : aucune logique executee.
// ============================================================================

// Liste fermee des familles de capteurs supportees (evite les fautes de frappe).
export type SensorType = "temperature" | "humidity" | "smoke" | "water" | "door" | "vibration" | "power" | "airflow" | "pressure";
// Etat d'un capteur : normal, en alerte, critique ou hors-ligne (offline = pas de donnee).
export type SensorStatus = "normal" | "warning" | "critical" | "offline";

// SensorReading : une mesure ponctuelle d'un capteur a un instant donne.
// C'est la donnee de base lue dans Zabbix puis affichee/comparee aux seuils.
export interface SensorReading {
  id: string;
  siteId: string;
  bayId?: string;              // baie concernee (optionnel : certains capteurs sont au niveau du site)
  type: SensorType;
  value: number;               // valeur mesuree (ex : 27.5)
  unit: string;                // unite associee (ex : "°C", "%")
  status: SensorStatus;        // etat calcule a partir de la valeur et des seuils
  threshold: { warning: number; critical: number }; // seuils appliques a cette mesure
  timestamp: string;
}

// SensorHistory : suite de mesures d'un meme capteur sur une periode.
// Sert a tracer les courbes (graphiques) et a detecter les tendances.
export interface SensorHistory {
  siteId: string;
  type: SensorType;
  readings: Array<{ value: number; timestamp: string }>; // points de la courbe (valeur + date)
  period: { from: string; to: string };                  // fenetre temporelle demandee
  // Niveau d'agregation : "raw" = brut, "hourly"/"daily" = moyennes par heure/jour
  // (Zabbix peut renvoyer des donnees deja agregees pour alleger l'affichage).
  aggregation: "raw" | "hourly" | "daily";
}

// BayEntity : une baie informatique (armoire) regroupant plusieurs capteurs.
// L'etat de la baie (status) resume l'etat le plus grave de ses capteurs.
export interface BayEntity {
  id: string;
  siteId: string;
  name: string;
  location: string;            // emplacement physique dans la salle
  status: SensorStatus;
  sensors: SensorReading[];    // mesures de tous les capteurs rattaches a la baie
  lastUpdate: string;
  powerConsumption: number;    // consommation electrique de la baie
}
