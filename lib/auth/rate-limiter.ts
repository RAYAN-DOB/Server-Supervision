/**
 * Rate limiter en mémoire pour l'endpoint de login.
 *
 * Limite : 5 tentatives par 15 minutes par clé (adresse IP).
 * Après 5 échecs : blocage de 30 minutes.
 *
 * Note : en serverless, l'état est partagé dans un même processus.
 * Pour une solution multi-instance, utiliser Redis/Upstash.
 */

// Suivi des tentatives pour une clé : nombre d'essais, début de la fenêtre, fin de blocage éventuelle.
interface RateRecord {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

// Stockage en mémoire : une entrée par clé (IP). Vidé au redémarrage du processus.
const _store = new Map<string, RateRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_MS = 30 * 60 * 1000; // 30 minutes

// Résultat renvoyé à l'appelant : autorisé ou non, et infos sur le blocage le cas échéant.
export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  blockedForMs?: number;
  blockedUntil?: Date;
}

// Cœur du rate limiter : appelé à chaque tentative de login pour décider si on l'autorise.
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = _store.get(key);

  // Vérifier si la clé est actuellement bloquée
  if (record?.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      blockedForMs: record.blockedUntil - now,
      blockedUntil: new Date(record.blockedUntil),
    };
  }

  // Réinitialiser si la fenêtre temporelle est expirée
  if (!record || now - record.windowStart > WINDOW_MS) {
    _store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Incrémenter le compteur
  record.count++;

  // Seuil dépassé : on déclenche un blocage de 30 minutes.
  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
    _store.set(key, record);
    return {
      allowed: false,
      blockedForMs: BLOCK_MS,
      blockedUntil: new Date(now + BLOCK_MS),
    };
  }

  // Encore sous le seuil : on autorise et on indique le nombre d'essais restants.
  _store.set(key, record);
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

// Remet à zéro le compteur d'une clé (appelé après une connexion réussie).
export function resetRateLimit(key: string): void {
  _store.delete(key);
}

// Nettoyage périodique des entrées expirées
// Évite que la Map grossisse sans fin avec des clés/IP qui ne reviennent plus.
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of _store) {
    const isBlockExpired = record.blockedUntil && now > record.blockedUntil;
    const isWindowExpired = now - record.windowStart > WINDOW_MS * 2;
    if (isBlockExpired || isWindowExpired) {
      _store.delete(key);
    }
  }
}, 5 * 60 * 1000); // Toutes les 5 minutes
