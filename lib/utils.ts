// =====================================================================
// FICHIER : lib/utils.ts
// ROLE DANS AURION : boite a outils de petites fonctions reutilisables
//   dans toute l'interface (formatage et calcul d'etat des indicateurs).
// CE QU'IL FOURNIT : fusion de classes CSS (cn), formatage de dates et
//   d'unites (temperature, humidite, octets), couleurs selon l'etat, et
//   calcul du statut (ok/warning/critical) a partir des seuils metier.
// POURQUOI : centraliser ces helpers evite de dupliquer le code dans les
//   composants et garantit un affichage coherent partout dans AURION.
// =====================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// "cn" = combine plusieurs classes CSS (conditionnelles via clsx) puis
// resout les conflits Tailwind via twMerge (ex : "p-2" + "p-4" -> "p-4").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formate une date au format francais (JJ/MM/AAAA HH:MM).
// Accepte une Date ou une chaine ISO (on convertit si necessaire).
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Affiche un temps relatif lisible ("Il y a 5 min") plutot qu'une date brute.
// Utile pour montrer la fraicheur d'une mesure ou d'une alerte.
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  // Ecart en secondes entre maintenant et la date fournie.
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // Paliers : <60s, <1h (3600s), <1j (86400s), <1 semaine (604800s).
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return formatDate(d); // au-dela d'une semaine : on affiche la date complete
}

// Renvoie un degrade Tailwind (couleur) correspondant a l'etat d'un site/equipement.
// Centralise le code couleur pour rester coherent dans toute l'UI.
export function getStatusColor(status: "ok" | "warning" | "critical" | "maintenance"): string {
  const colors = {
    ok: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-orange-500",
    critical: "from-red-500 to-pink-500",
    maintenance: "from-blue-500 to-cyan-500",
  };
  return colors[status];
}

// Couleur (hex) associee a la severite d'une alerte, du bleu (info) au rouge (critique).
export function getSeverityColor(severity: "info" | "minor" | "major" | "critical"): string {
  const colors = {
    info: "#00F0FF",
    minor: "#FFD600",
    major: "#FF8A00",
    critical: "#FF0055",
  };
  return colors[severity];
}

// Affiche une temperature avec 1 decimale et l'unite (ex : "22.5°C").
export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

// Affiche une humidite arrondie a l'entier avec le symbole "%" (ex : "45%").
export function formatHumidity(humidity: number): string {
  return `${humidity.toFixed(0)}%`;
}

// Convertit un nombre d'octets en unite lisible (B, KB, MB...).
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024; // 1 Ko = 1024 octets
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  // On calcule l'index d'unite via le logarithme (combien de fois on divise par 1024).
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // On ramene la valeur dans l'unite trouvee, arrondie a 2 decimales.
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Determine l'etat d'une temperature selon les seuils metier d'une salle serveur.
// >30°C = critique, >25°C = avertissement, sinon normal.
export function getTemperatureStatus(temp: number): "ok" | "warning" | "critical" {
  if (temp > 30) return "critical";
  if (temp > 25) return "warning";
  return "ok";
}

// Determine l'etat d'une humidite : trop sec ou trop humide est dangereux pour le materiel.
// Hors [30%-70%] = critique, hors [40%-60%] = avertissement, sinon normal.
export function getHumidityStatus(humidity: number): "ok" | "warning" | "critical" {
  if (humidity < 30 || humidity > 70) return "critical";
  if (humidity < 40 || humidity > 60) return "warning";
  return "ok";
}

// Genere un identifiant court "aleatoire" (base 36) pour des elements cote UI.
// Suffisant pour des cles temporaires, pas pour de la securite.
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// "debounce" : retarde l'execution d'une fonction tant que des appels arrivent.
// Utile pour ne declencher une action (ex : recherche) qu'apres la fin de la saisie.
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    // Chaque nouvel appel annule le minuteur precedent et en relance un.
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait); // execution apres "wait" ms d'inactivite
  };
}
