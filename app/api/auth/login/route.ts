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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitKey = `login:${ip}`;

    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.blockedForMs ?? 0) / 60000);
      return NextResponse.json(
        {
          error: `Trop de tentatives. Reessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.blockedForMs ?? 0) / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const email: string = (body.email ?? "").trim().toLowerCase();
    const password: string = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);

    // Dummy bcrypt si utilisateur inexistant : protection timing attack.
    if (!user || !user.isActive) {
      await bcrypt.hash("dummy-anti-timing-attack", 12);
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

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
        action: "Tentative connexion - compte verrouille",
        details: `Compte verrouille jusqu'a ${lockedUntil}`,
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error: `Compte temporairement verrouille. Reessayez apres ${lockedUntil}.`,
        },
        { status: 423 }
      );
    }

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
        action: "Echec connexion",
        details: `Mot de passe incorrect - ${attemptsLeft} tentative(s) restante(s)`,
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

    recordSuccessfulLogin(user.id);
    resetRateLimit(rateLimitKey);

    addAuditEntry({
      userId: user.id,
      userName: user.name,
      action: "Connexion reussie",
      details: `Role : ${user.role}`,
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

    const forwardedProto = req.headers.get("x-forwarded-proto");
    const host = req.headers.get("host") ?? "";
    const isLocalDemoHost =
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("127.") ||
      host.startsWith("localhost");

    response.cookies.set("aurion-token", token, {
      httpOnly: true,
      // La VM de soutenance tourne en production mais sur HTTP local.
      // Sur ce reseau prive, Secure=false permet au navigateur de garder la session.
      // Sur Vercel/HTTPS, le cookie reste securise.
      secure: forwardedProto === "https" && !isLocalDemoHost,
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    response.cookies.delete("aurion-user");

    return response;
  } catch (error) {
    console.error("[Login]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
