import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken, signToken, blacklistToken } from "@/lib/auth/jwt";
import {
  getUserById,
  updateUser,
  addAuditEntry,
} from "@/lib/auth/store";

// Validation de la complexité du mot de passe
function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) {
    return "Le mot de passe doit contenir au moins 12 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre majuscule";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre minuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // ── Authentification ──────────────────────────────────────────────────
    const token = req.cookies.get("aurion-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session invalide ou expirée" },
        { status: 401 }
      );
    }

    const user = getUserById(payload.id);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    // ── Validation des données ────────────────────────────────────────────
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier le mot de passe actuel
    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 401 }
      );
    }

    // Vérifier que les nouveaux mots de passe correspondent
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Les nouveaux mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    // Interdire la réutilisation du mot de passe actuel
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      );
    }

    // Vérifier la complexité
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    // ── Mise à jour du mot de passe ───────────────────────────────────────
    const newHash = await bcrypt.hash(newPassword, 12);
    updateUser(user.id, {
      passwordHash: newHash,
      mustChangePassword: false,
    });

    // Invalider l'ancien token
    if (payload.jti) {
      blacklistToken(payload.jti, payload.exp);
    }

    // Émettre un nouveau token sans mustChangePassword
    const newToken = await signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      mustChangePassword: false,
    });

    addAuditEntry({
      userId: user.id,
      userName: user.name,
      action: "Mot de passe modifié",
      details: "Changement de mot de passe réussi",
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("aurion-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[ChangePassword]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
