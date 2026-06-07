import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
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
        "[AURION] AUTH_SECRET non defini ou trop court (min. 32 caracteres). " +
          "Definissez cette variable dans les parametres Vercel."
      );
    }

    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[AURION] AUTH_SECRET non defini - utilisation du secret de developpement. " +
          "Ne pas utiliser en production."
      );
    }

    return new TextEncoder().encode(
      "aurion-dev-secret-only-DO-NOT-USE-IN-PRODUCTION-!!"
    );
  }

  return new TextEncoder().encode(authSecret);
}

interface BlacklistEntry {
  exp: number;
}

const tokenBlacklist = new Map<string, BlacklistEntry>();

export function blacklistToken(jti: string, expiresAt: number): void {
  tokenBlacklist.set(jti, { exp: expiresAt });

  const now = Date.now() / 1000;
  for (const [id, entry] of tokenBlacklist) {
    if (entry.exp < now) tokenBlacklist.delete(id);
  }
}

export function isTokenBlacklisted(jti: string): boolean {
  return tokenBlacklist.has(jti);
}

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

export async function verifyToken(token: string): Promise<VerifiedToken | null> {
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
