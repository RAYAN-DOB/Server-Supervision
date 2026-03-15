import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  recordFailedLogin,
  recordSuccessfulLogin,
  isAccountLocked,
  addAuditEntry,
} from "@/lib/auth/store";
import { signToken } from "@/lib/auth/jwt";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // ── Extraction de l'adresse IP pour le rate limiting ──────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitKey = `login:${ip}`;

    // ── Rate limiting ──────────────────────────────────────────────────────
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.blockedForMs ?? 0) / 60000);
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.blockedForMs ?? 0) / 1000)),
          },
        }
      );
    }

    // ── Validation des entrées ─────────────────────────────────────────────
    const body = await req.json();
    const email: string = (body.email ?? "").trim().toLowerCase();
    const password: string = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Validation basique du format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // ── Vérification de l'utilisateur ─────────────────────────────────────
    const user = getUserByEmail(email);

    // Dummy bcrypt si utilisateur inexistant → protection timing attack
    if (!user || !user.isActive) {
      await bcrypt.hash("dummy-anti-timing-attack", 12);
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // ── Vérification verrouillage compte ──────────────────────────────────
    if (isAccountLocked(user)) {
      const lockedUntil = user.lockedUntil
        ? new Date(user.lockedUntil).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "plus tard";

      addAuditEntry({
        userId: user.id,
        userName: user.name,
        action: "Tentative connexion — compte verrouillé",
        details: `Compte verrouillé jusqu'à ${lockedUntil}`,
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error: `Compte temporairement verrouillé. Réessayez après ${lockedUntil}.`,
        },
        { status: 423 }
      );
    }

    // ── Vérification du mot de passe ──────────────────────────────────────
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      recordFailedLogin(user.id);
      const updatedUser = getUserByEmail(email);
      const attemptsLeft = Math.max(
        0,
        5 - (updatedUser?.failedLoginAttempts ?? 0)
      );

      addAuditEntry({
        userId: user.id,
        userName: user.name,
        action: "Échec connexion",
        details: `Mot de passe incorrect — ${attemptsLeft} tentative(s) restante(s)`,
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error:
            attemptsLeft > 0
              ? `Identifiants incorrects. ${attemptsLeft} tentative(s) avant verrouillage.`
              : "Identifiants incorrects",
        },
        { status: 401 }
      );
    }

    // ── Connexion réussie ─────────────────────────────────────────────────
    recordSuccessfulLogin(user.id);
    resetRateLimit(rateLimitKey);

    addAuditEntry({
      userId: user.id,
      userName: user.name,
      action: "Connexion réussie",
      details: `Rôle : ${user.role}`,
      ipAddress: ip,
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      mustChangePassword: user.mustChangePassword,
    });

    const response = NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        mustChangePassword: user.mustChangePassword,
      },
    });

    response.cookies.set("aurion-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 heures
      path: "/",
    });

    // Supprimer l'ancien cookie non-httpOnly s'il existe
    response.cookies.delete("aurion-user");

    return response;
  } catch (error) {
    console.error("[Login]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
