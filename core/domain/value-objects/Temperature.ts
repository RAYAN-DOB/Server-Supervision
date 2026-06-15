// ============================================================================
// Temperature — Value-Object "Temperature" (couche core/domain)
// ----------------------------------------------------------------------------
// Role : encapsuler une valeur de temperature et toute sa logique metier
//        (validation, arrondi, calcul de l'etat normal/warning/critical).
// Principe "value-object" : objet immuable, cree via des fabriques statiques
//        (fromCelsius/fromRaw), pas par "new" direct (constructeur prive).
// Recoit : un nombre (degres). Produit : un objet Temperature sur, comparable.
// ============================================================================
export class Temperature {
  // Constructeur PRIVE : on force la creation via fromCelsius/fromRaw afin de
  // garantir que toute Temperature est valide et coherente.
  private constructor(
    public readonly value: number,
    public readonly unit: "celsius" | "fahrenheit" = "celsius"
  ) {}

  // fromCelsius : fabrique avec garde-fou. Refuse les valeurs aberrantes
  // (hors -50°C / 150°C) qui trahiraient une erreur de capteur ou de saisie.
  static fromCelsius(value: number): Temperature {
    if (value < -50 || value > 150) throw new RangeError(`Invalid temperature: ${value}°C`);
    return new Temperature(value, "celsius");
  }

  // fromRaw : fabrique pour une valeur brute issue de Zabbix. On arrondit a une
  // decimale (Math.round(x*10)/10) pour un affichage propre, sans valider la plage.
  static fromRaw(value: number): Temperature {
    return new Temperature(Math.round(value * 10) / 10, "celsius");
  }

  get celsius(): number { return this.value; }

  // status : etat metier par defaut. Une salle serveur peut etre en alerte si
  // elle est trop chaude (>=35 critique, >=28 warning) MAIS aussi trop froide
  // (<=10 warning), d'ou les deux bornes.
  get status(): "normal" | "warning" | "critical" {
    if (this.value >= 35) return "critical";
    if (this.value >= 28) return "warning";
    if (this.value <= 10) return "warning";
    return "normal";
  }

  // isAboveThreshold : compare la temperature a des seuils personnalises passes
  // en parametre (au lieu des seuils par defaut de "status"). Le critique est
  // teste en premier pour qu'il l'emporte sur le warning.
  isAboveThreshold(warning: number, critical: number): "normal" | "warning" | "critical" {
    if (this.value >= critical) return "critical";
    if (this.value >= warning) return "warning";
    return "normal";
  }

  // toString : affichage formate avec une decimale (ex : "27.5°C").
  toString(): string {
    return `${this.value.toFixed(1)}°C`;
  }
}
