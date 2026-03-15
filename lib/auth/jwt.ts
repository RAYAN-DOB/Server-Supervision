/**
 * Utilitaires JWT — utilise `jose` (compatible Edge / Netlify Functions).
 *
 * Sécurité :
 * - Secret via AUTH_SECRET (min. 32 caractères, obligatoire en production)
 * - Tokens HS256 avec JTI (JWT ID) pour la révocation
 * - Expiration 8h (réduite depuis 24h)
 * - Blacklist en mémoire pour invalider les tokens après logout
 */

import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "./store";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  mustChangePassword?: boolean;
}

function getSecret(): Uint8Array {
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret || authSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[AURION] AUTH_SECRET non défini ou trop court (min. 32 caractères). " +
          "Définissez cette variable dans les paramètres Netlify."
      );
    }
    // Fallback développement uniquement — jamais utilisé en production
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[AURION] ⚠ AUTH_SECRET non défini — utilisation du secret de développement. " +
          "NE PAS utiliser en production."
      );
    }
    return new TextEncoder().encode(
      "aurion-dev-secret-only-DO-NOT-USE-IN-PRODUCTION-!!"
    );
  }

  return new TextEncoder().encode(authSecret);
}

// ─── Blacklist JWT (invalide les tokens après logout) ─────────────────────────
// Note : en mémoire — partagé uniquement dans le même processus Node.js.
// En serverless, les tokens expirés naturellement après 8h même si non révoqués.

interface BlacklistEntry {
  exp: number; // timestamp expiry du token
}

const _blacklist = new Map<string, BlacklistEntry>();

export function blacklistToken(jti: string, expiresAt: number): void {
  _blacklist.set(jti, { exp: expiresAt });
  // Nettoyage des tokens expirés pour éviter la fuite mémoire
  const now = Date.now() / 1000;
  for (const [id, entry] of _blacklist) {
    if (entry.exp < now) _blacklist.delete(id);
  }
}

export function isTokenBlacklisted(jti: string): boolean {
  return _blacklist.has(jti);
}

// ─── Fonctions principales ────────────────────────────────────────────────────

export async function signToken(user: AuthUser): Promise<string> {
  const jti = crypto.randomUUID();
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setJti(jti)
    .setIssuer("aurion.maisons-alfort.fr")
    .setAudience("aurion-dsi")
    .sign(getSecret());
}

export interface VerifiedToken extends AuthUser {
  jti: string;
  exp: number;
  iat: number;
}

export async function verifyToken(
  token: string
): Promise<VerifiedToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "aurion.maisons-alfort.fr",
      audience: "aurion-dsi",
    });

    const jti = payload.jti as string | undefined;
    if (jti && isTokenBlacklisted(jti)) {
      return null;
    }

    return payload as unknown as VerifiedToken;
  } catch {
    return null;
  }
}
