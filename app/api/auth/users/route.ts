import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth/jwt";
import {
  getUsers,
  createUser,
  getUserByEmail,
  addAuditEntry,
} from "@/lib/auth/store";
import type { UserRole } from "@/lib/auth/store";

const ALLOWED_DOMAIN = "maisons-alfort.fr";

// Validation de la complexité du mot de passe
function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) {
    return "Le mot de passe doit contenir au moins 12 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Requis : au moins une lettre majuscule";
  }
  if (!/[a-z]/.test(password)) {
    return "Requis : au moins une lettre minuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Requis : au moins un chiffre";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Requis : au moins un caractère spécial (!@#$%...)";
  }
  return null;
}

// GET /api/auth/users — liste des utilisateurs (admin uniquement)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const users = getUsers().map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    role: u.role,
    department: u.department,
    phone: u.phone,
    isActive: u.isActive,
    mustChangePassword: u.mustChangePassword,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    createdBy: u.createdBy,
    failedLoginAttempts: u.failedLoginAttempts,
    lockedUntil: u.lockedUntil,
  }));

  return NextResponse.json({ users });
}

// POST /api/auth/users — créer un utilisateur (admin uniquement)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const body = await req.json();
  const { email, username, name, password, role, department, phone } = body;

  // ── Validation des champs requis ──────────────────────────────────────────
  if (!email || !username || !name || !password || !role) {
    return NextResponse.json(
      { error: "Champs requis : email, username, name, password, role" },
      { status: 400 }
    );
  }

  // ── Validation du domaine email ───────────────────────────────────────────
  const emailNorm = (email as string).trim().toLowerCase();
  const emailDomain = emailNorm.split("@")[1];
  if (emailDomain !== ALLOWED_DOMAIN) {
    return NextResponse.json(
      {
        error: `Les comptes doivent avoir une adresse @${ALLOWED_DOMAIN}`,
      },
      { status: 400 }
    );
  }

  // ── Validation du format email ────────────────────────────────────────────
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json(
      { error: "Format d'email invalide" },
      { status: 400 }
    );
  }

  // ── Vérification rôles ────────────────────────────────────────────────────
  const validRoles: UserRole[] = ["super_admin", "admin", "tech", "viewer"];
  if (!validRoles.includes(role as UserRole)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  if (role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json(
      { error: "Seul un super_admin peut créer un autre super_admin" },
      { status: 403 }
    );
  }

  // ── Vérification existence email (message identique pour éviter l'énumération) ──
  const existingUser = getUserByEmail(emailNorm);
  if (existingUser) {
    return NextResponse.json(
      { error: "Un compte avec cet email existe déjà" },
      { status: 409 }
    );
  }

  // ── Validation mot de passe ───────────────────────────────────────────────
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  // ── Création du compte ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);

  const user = createUser({
    email: emailNorm,
    username: (username as string).trim(),
    name: (name as string).trim(),
    role: role as UserRole,
    department,
    phone,
    passwordHash,
    isActive: true,
    mustChangePassword: true, // Changement obligatoire à la première connexion
    createdBy: auth.username,
    failedLoginAttempts: 0,
  });

  addAuditEntry({
    userId: auth.id,
    userName: auth.name,
    action: "Création compte",
    details: `Compte créé pour ${user.name} (${user.email}) — rôle : ${user.role}`,
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
    },
    { status: 201 }
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("aurion-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
