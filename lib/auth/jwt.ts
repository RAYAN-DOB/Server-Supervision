/**
 * Gestion des jetons JWT d'authentification d'AURION.
 *
 * Role : crée (signToken) et vérifie (verifyToken) les jetons qui prouvent
 * l'identité d'un membre de la DSI après connexion. Le jeton est ensuite
 * stocké dans un cookie et relu par le middleware à chaque requête.
 * Reçoit un AuthUser -> produit une chaîne JWT signée (et inversement).
 * Gère aussi une liste noire (blacklist) pour invalider un jeton avant son expiration (logout).
 */

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import type { UserRole } from "./store";

// Données utilisateur stockées EN CLAIR dans le jeton (jamais le mot de passe).
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  mustChangePassword?: boolean;
}

// Récupère la clé secrète servant à signer/vérifier les jetons.
// La même clé doit être utilisée à la signature ET à la vérification (algo symétrique HS256).
function getSecret(): Uint8Array {
  const authSecret = process.env.AUTH_SECRET;

  // Secret absent ou trop court (< 32 caractères = trop faible) : on adapte selon l'environnement.
  if (!authSecret || authSecret.length < 32) {
    // En production, refus catégorique : pas de secret = on plante (fail-safe sécurité).
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[AURION] AUTH_SECRET non defini ou trop court (min. 32 caracteres). " +
          "Definissez cette variable dans les parametres Vercel."
      );
    }

    // Hors test : on prévient juste le développeur via la console.
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[AURION] AUTH_SECRET non defini - utilisation du secret de developpement. " +
          "Ne pas utiliser en production."
      );
    }

    // En développement, secret de repli pour pouvoir tester l'app localement.
    return new TextEncoder().encode(
      "aurion-dev-secret-only-DO-NOT-USE-IN-PRODUCTION-!!"
    );
  }

  // Cas normal : on encode le secret de l'environnement en octets (format attendu par jose).
  return new TextEncoder().encode(authSecret);
}

// Une entrée de liste noire = un jeton invalidé, gardé jusqu'à sa date d'expiration.
interface BlacklistEntry {
  exp: number;
}

// Liste noire des jetons révoqués (ex : déconnexion). Indexée par jti (identifiant unique du jeton).
const tokenBlacklist = new Map<string, BlacklistEntry>();

// Révoque un jeton avant son expiration naturelle (utilisé au logout).
export function blacklistToken(jti: string, expiresAt: number): void {
  tokenBlacklist.set(jti, { exp: expiresAt });

  // Au passage, on purge les jetons déjà expirés pour éviter que la Map grossisse indéfiniment.
  const now = Date.now() / 1000;
  for (const [id, entry] of tokenBlacklist) {
    if (entry.exp < now) tokenBlacklist.delete(id);
  }
}

// Indique si un jeton a été révoqué (présent dans la liste noire).
export function isTokenBlacklisted(jti: string): boolean {
  return tokenBlacklist.has(jti);
}

// Crée un jeton JWT signé à partir des infos utilisateur (appelé après une connexion réussie).
export async function signToken(user: AuthUser): Promise<string> {
  // jti = identifiant unique du jeton, indispensable pour pouvoir le révoquer plus tard.
  const jti = crypto.randomUUID();

  // Construction du jeton : on intègre les données user puis on ajoute les métadonnées de sécurité.
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" }) // Algorithme de signature symétrique.
    .setIssuedAt()                         // Date d'émission (iat).
    .setExpirationTime("8h")               // Expiration auto après 8h (durée d'une journée de travail).
    .setJti(jti)                           // Identifiant unique du jeton.
    .setIssuer("aurion.maisons-alfort.fr") // Émetteur attendu (vérifié à la lecture).
    .setAudience("aurion-dsi")             // Destinataire attendu (vérifié à la lecture).
    .sign(getSecret());                    // Signature avec la clé secrète.
}

// Données décodées d'un jeton valide : infos user + métadonnées (jti, expiration, émission).
export interface VerifiedToken extends AuthUser {
  jti: string;
  exp: number;
  iat: number;
}

// Vérifie un jeton et renvoie son contenu, ou null s'il est invalide/expiré/révoqué.
export async function verifyToken(token: string): Promise<VerifiedToken | null> {
  try {
    // jwtVerify contrôle la signature, l'expiration, l'émetteur et le destinataire.
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "aurion.maisons-alfort.fr",
      audience: "aurion-dsi",
    });

    // Même si la signature est bonne, on rejette le jeton s'il a été révoqué (liste noire).
    const jti = payload.jti as string | undefined;
    if (jti && isTokenBlacklisted(jti)) {
      return null;
    }

    return payload as unknown as VerifiedToken;
  } catch {
    // Toute erreur (signature fausse, jeton expiré ou altéré) -> jeton refusé.
    return null;
  }
}
