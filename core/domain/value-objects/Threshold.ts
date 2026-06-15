// ============================================================================
// Threshold — Value-Object "Seuil" (couche core/domain)
// ----------------------------------------------------------------------------
// Role : centraliser la regle qui transforme une mesure brute en etat
//        normal / warning / critical, selon des seuils et un sens de comparaison.
// Recoit : une valeur numerique. Produit : l'etat correspondant.
// Contient aussi DEFAULT_THRESHOLDS : les seuils par defaut de chaque type de capteur.
// ============================================================================

// ThresholdConfig : reglage d'un seuil = les 2 paliers (warning, critical) et
// la "direction" du danger (au-dessus, en-dessous, ou les deux cotes).
export interface ThresholdConfig {
  warning: number;
  critical: number;
  direction: "above" | "below" | "both";
}

export class Threshold {
  constructor(private config: ThresholdConfig) {}

  // evaluate : applique la regle de seuil a une valeur et renvoie son etat.
  // La logique change selon la direction du danger :
  evaluate(value: number): "normal" | "warning" | "critical" {
    const { warning, critical, direction } = this.config;
    // "above" : c'est le DEPASSEMENT vers le haut qui est dangereux (ex : temperature).
    if (direction === "above") {
      if (value >= critical) return "critical";
      if (value >= warning) return "warning";
      return "normal";
    }
    // "below" : c'est la CHUTE qui est dangereuse (ex : flux d'air, pression).
    if (direction === "below") {
      if (value <= critical) return "critical";
      if (value <= warning) return "warning";
      return "normal";
    }
    // "both" : danger des deux cotes. On compare la valeur au seuil ET a son oppose
    // (ex : -critical) pour couvrir les ecarts positifs comme negatifs.
    if (value >= critical || value <= -critical) return "critical";
    if (value >= warning || value <= -warning) return "warning";
    return "normal";
  }
}

// DEFAULT_THRESHOLDS : table des seuils par defaut, indexee par type de capteur.
// Sert de reference quand aucun seuil specifique n'est defini pour un site.
// A noter : airflow et pressure utilisent "below" car c'est leur BAISSE qui alerte.
export const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  temperature: { warning: 28, critical: 35, direction: "above" },
  humidity: { warning: 65, critical: 80, direction: "above" },
  vibration: { warning: 0.3, critical: 0.5, direction: "above" },
  airflow: { warning: 80, critical: 60, direction: "below" },
  pressure: { warning: 1005, critical: 1000, direction: "below" },
};
