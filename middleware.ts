import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      // En production sans secret, on refuse tout accès (fail-safe)
      return new Uint8Array(0);
    }
    return new TextEncoder().encode(
      "aurion-dev-secret-only-DO-NOT-USE-IN-PRODUCTION-!!"
    );
  }
  return new TextEncoder().encode(authSecret);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("aurion-token")?.value;

  if (pathname.startsWith("/demo")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", "demo-live-user");
    requestHeaders.set("x-user-role", "viewer");
    requestHeaders.set("x-user-name", "Demo Live");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", "demo-user");
    requestHeaders.set("x-user-role", "viewer");
    requestHeaders.set("x-user-name", "Mode demo BTS");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Pas de token → redirection vers login ─────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = getSecret();

    // Vérification du secret (fail-safe si AUTH_SECRET manquant en prod)
    if (secret.length === 0) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "config");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("aurion-token");
      return response;
    }

    const { payload } = await jwtVerify(token, secret, {
      issuer: "aurion.maisons-alfort.fr",
      audience: "aurion-dsi",
    });

    const role = payload.role as string;
    const mustChangePassword = payload.mustChangePassword as boolean | undefined;

    // ── Changement de mot de passe obligatoire ─────────────────────────
    // Si mustChangePassword=true, seule la page /change-password est accessible
    if (
      mustChangePassword === true &&
      !pathname.startsWith("/change-password")
    ) {
      return NextResponse.redirect(new URL("/change-password?forced=true", request.url));
    }

    // ── Protection de /admin : super_admin et admin uniquement ─────────
    if (
      pathname.startsWith("/admin") &&
      role !== "super_admin" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ── Propagation de l'identité utilisateur vers les API routes ──────
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.id ?? ""));
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-name", String(payload.name ?? ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalide, expiré ou altéré
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("aurion-token");
    return response;
  }
}

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
