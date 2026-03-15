/**
 * Rate limiter en mémoire pour l'endpoint de login.
 *
 * Limite : 5 tentatives par 15 minutes par clé (adresse IP).
 * Après 5 échecs : blocage de 30 minutes.
 *
 * Note : en serverless, l'état est partagé dans un même processus.
 * Pour une solution multi-instance, utiliser Redis/Upstash.
 */

interface RateRecord {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

const _store = new Map<string, RateRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_MS = 30 * 60 * 1000; // 30 minutes

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  blockedForMs?: number;
  blockedUntil?: Date;
}

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

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
    _store.set(key, record);
    return {
      allowed: false,
      blockedForMs: BLOCK_MS,
      blockedUntil: new Date(now + BLOCK_MS),
    };
  }

  _store.set(key, record);
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

export function resetRateLimit(key: string): void {
  _store.delete(key);
}

// Nettoyage périodique des entrées expirées
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
