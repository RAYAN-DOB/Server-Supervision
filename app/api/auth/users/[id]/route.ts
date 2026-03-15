import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth/jwt";
import {
  getUserById,
  updateUser,
  deleteUser,
  addAuditEntry,
} from "@/lib/auth/store";
import type { UserRole } from "@/lib/auth/store";

// Validation de la complexité du mot de passe
function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) {
    return "Le mot de passe doit contenir au moins 12 caractères";
  }
  if (!/[A-Z]/.test(password)) return "Requis : au moins une lettre majuscule";
  if (!/[a-z]/.test(password)) return "Requis : au moins une lettre minuscule";
  if (!/[0-9]/.test(password)) return "Requis : au moins un chiffre";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Requis : au moins un caractère spécial";
  return null;
}

// PATCH /api/auth/users/[id] — modifier un utilisateur
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const { id } = await params;
  const target = getUserById(id);

  if (!target) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  // Protection hiérarchique des rôles
  if (target.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  const changes: string[] = [];

  if (body.name) {
    updates.name = (body.name as string).trim();
    changes.push("nom");
  }
  if (body.department !== undefined) {
    updates.department = body.department;
    changes.push("département");
  }
  if (body.phone !== undefined) {
    updates.phone = body.phone;
    changes.push("téléphone");
  }
  if (body.isActive !== undefined) {
    updates.isActive = body.isActive;
    changes.push(body.isActive ? "activé" : "désactivé");
  }
  if (body.mustChangePassword !== undefined && auth.role === "super_admin") {
    updates.mustChangePassword = body.mustChangePassword;
    changes.push("flag changement MDP");
  }

  // Changement de rôle : super_admin uniquement
  if (body.role !== undefined) {
    if (auth.role !== "super_admin") {
      return NextResponse.json(
        { error: "Seul un super_admin peut modifier les rôles" },
        { status: 403 }
      );
    }
    const validRoles: UserRole[] = ["super_admin", "admin", "tech", "viewer"];
    if (!validRoles.includes(body.role as UserRole)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    updates.role = body.role;
    changes.push(`rôle → ${body.role}`);
  }

  // Changement de mot de passe par un admin
  if (body.password) {
    const passwordError = validatePasswordStrength(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    updates.passwordHash = await bcrypt.hash(body.password, 12);
    updates.mustChangePassword = true; // Forcer le changement à la prochaine connexion
    changes.push("mot de passe réinitialisé");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Aucune modification fournie" },
      { status: 400 }
    );
  }

  const updated = updateUser(id, updates);

  addAuditEntry({
    userId: auth.id,
    userName: auth.name,
    action: "Modification compte",
    details: `Compte de ${target.name} modifié : ${changes.join(", ")}`,
  });

  return NextResponse.json({ success: true, user: updated });
}

// DELETE /api/auth/users/[id] — supprimer un utilisateur
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const { id } = await params;

  if (id === auth.id) {
    return NextResponse.json(
      { error: "Impossible de supprimer votre propre compte" },
      { status: 400 }
    );
  }

  const target = getUserById(id);
  if (!target) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  // Protection hiérarchique
  if (target.role === "super_admin" && auth.role !== "super_admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  // Interdit la suppression des comptes DSI système (IDs préfixés "dsi-")
  if (id.startsWith("dsi-")) {
    return NextResponse.json(
      {
        error:
          "Les comptes DSI système ne peuvent pas être supprimés. Désactivez-les si nécessaire.",
      },
      { status: 403 }
    );
  }

  const deleted = deleteUser(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Impossible de supprimer ce compte" },
      { status: 403 }
    );
  }

  addAuditEntry({
    userId: auth.id,
    userName: auth.name,
    action: "Suppression compte",
    details: `Compte de ${target.name} (${target.email}) supprimé`,
  });

  return NextResponse.json({ success: true });
}

// ─── Helper ────────────────────────────────────────────────────────────────────

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("aurion-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
