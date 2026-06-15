/**
 * Middleware d'authentification d'AURION (s'exécute AVANT chaque page protégée).
 *
 * Role : c'est le "videur" de l'application. À chaque requête vers une route listée
 * dans `config.matcher`, il vérifie le jeton JWT du cookie, gère le mode démo, force
 * le changement de mot de passe et protège la zone /admin selon le rôle.
 * Il laisse passer (NextResponse.next) ou redirige (vers /login, /dashboard...).
 * Au passage, il transmet l'identité de l'utilisateur aux API via des en-têtes x-user-*.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

// Récupère la clé secrète de vérification (doit être identique à celle utilisée pour signer).
function getSecret(): Uint8Array {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      // En production sans secret, on refuse tout acces (fail-safe).
      // Un tableau vide signale "pas de secret" : on bloquera l'accès plus bas.
      return new Uint8Array(0);
    }
    return new TextEncoder().encode(
      "aurion-dev-secret-only-DO-NOT-USE-IN-PRODUCTION-!!"
    );
  }
  return new TextEncoder().encode(authSecret);
}

// Fonction exécutée par Next.js avant chaque requête correspondant au matcher (voir config en bas).
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;          // Chemin demandé (ex: /admin/users).
  const token = request.cookies.get("aurion-token")?.value; // Jeton JWT stocké dans le cookie.

  // Section /demo : accès libre en lecture, on injecte un faux utilisateur "viewer" (pas de login requis).
  if (pathname.startsWith("/demo")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", "demo-live-user");
    requestHeaders.set("x-user-role", "viewer");
    requestHeaders.set("x-user-name", "Demo Live");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Mode démo global (présentation BTS) : toute l'app est accessible en simple "viewer".
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // En démo, l'espace d'administration reste interdit : on renvoie vers le dashboard.
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", "demo-user");
    requestHeaders.set("x-user-role", "viewer");
    requestHeaders.set("x-user-name", "Mode demo BTS");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  // Pas de token : redirection vers login.
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // À partir d'ici : mode normal avec un token présent. On tente de le vérifier.
  try {
    const secret = getSecret();
    // Verification du secret (fail-safe si AUTH_SECRET est manquant en prod).
    // secret vide = config invalide en prod : on déconnecte et on signale l'erreur.
    if (secret.length === 0) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "config");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("aurion-token");
      return response;
    }

    // Vérifie signature + expiration + émetteur + destinataire. Lève une erreur si invalide.
    const { payload } = await jwtVerify(token, secret, {
      issuer: "aurion.maisons-alfort.fr",
      audience: "aurion-dsi",
    });

    // On extrait du jeton les infos nécessaires aux contrôles d'accès.
    const role = payload.role as string;
    const mustChangePassword = payload.mustChangePassword as boolean | undefined;
    // Changement de mot de passe obligatoire.
    // Si mustChangePassword=true, seule la page /change-password est accessible
    if (
      mustChangePassword === true &&
      !pathname.startsWith("/change-password")
    ) {
      return NextResponse.redirect(new URL("/change-password?forced=true", request.url));
    }
    // Protection de /admin : super_admin et admin uniquement.
    if (
      pathname.startsWith("/admin") &&
      role !== "super_admin" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Propagation de l identite utilisateur vers les API routes.
    // Les API n'ont pas à redécoder le jeton : elles lisent simplement ces en-têtes.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.id ?? ""));
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-name", String(payload.name ?? ""));

    // Tout est bon : on laisse passer la requête avec les en-têtes enrichis.
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalide, expire ou altere.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("aurion-token");
    return response;
  }
}

// Liste blanche des routes protégées par ce middleware.
// Seules ces URL déclenchent la fonction ci-dessus ; les autres (assets, /login...) passent directement.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sites/:path*",
    "/alertes/:path*",
    "/carte/:path*",
    "/analytics/:path*",
    "/historique/:path*",
    "/rapports/:path*",
    "/demo/:path*",
    "/architecture/:path*",
    "/admin/:path*",
    "/change-password",
  ],
};
