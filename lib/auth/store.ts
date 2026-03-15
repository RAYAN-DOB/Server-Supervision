/**
 * Stockage des utilisateurs en mémoire côté serveur.
 *
 * Tous les membres de la DSI de Maisons-Alfort sont pré-configurés avec
 * un mot de passe temporaire défini par INITIAL_DSI_PASSWORD.
 * Le flag mustChangePassword=true force le changement à la première connexion.
 *
 * ⚠ Persistance : ce store est en mémoire. En serverless (Netlify Functions),
 *   les comptes créés dynamiquement sont perdus au cold start. Les 9 comptes
 *   DSI sont recréés à chaque démarrage depuis les constantes ci-dessous.
 */

import bcrypt from "bcryptjs";

export type UserRole = "super_admin" | "admin" | "tech" | "viewer";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  passwordHash: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
}

// ─── Membres DSI de Maisons-Alfort ────────────────────────────────────────────

const DSI_MEMBERS: Array<{
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
}> = [
  {
    id: "dsi-001",
    email: "rayan.dob@maisons-alfort.fr",
    username: "rayan.dob",
    name: "Rayan DOB",
    role: "super_admin",
  },
  {
    id: "dsi-002",
    email: "alain.thoisy@maisons-alfort.fr",
    username: "alain.thoisy",
    name: "Alain THOISY",
    role: "admin",
  },
  {
    id: "dsi-003",
    email: "amrane.benbacha@maisons-alfort.fr",
    username: "amrane.benbacha",
    name: "Amrane BENBACHA",
    role: "admin",
  },
  {
    id: "dsi-004",
    email: "ouahib.lazla@maisons-alfort.fr",
    username: "ouahib.lazla",
    name: "Ouahib LAZLA",
    role: "admin",
  },
  {
    id: "dsi-005",
    email: "sebastien.adamides@maisons-alfort.fr",
    username: "sebastien.adamides",
    name: "Sebastien ADAMIDES",
    role: "admin",
  },
  {
    id: "dsi-006",
    email: "pauline.prak@maisons-alfort.fr",
    username: "pauline.prak",
    name: "Pauline PRAK",
    role: "admin",
  },
  {
    id: "dsi-007",
    email: "jean-luc.berrivin@maisons-alfort.fr",
    username: "jean-luc.berrivin",
    name: "Jean-Luc BERRIVIN",
    role: "admin",
  },
  {
    id: "dsi-008",
    email: "mahamadou.drame@maisons-alfort.fr",
    username: "mahamadou.drame",
    name: "Mahamadou DRAME",
    role: "admin",
  },
  {
    id: "dsi-009",
    email: "bruno.gouget@maisons-alfort.fr",
    username: "bruno.gouget",
    name: "Bruno GOUGET",
    role: "admin",
  },
];

// ─── Store module-level (partagé dans un même processus Node.js) ─────────────

const _store = new Map<string, StoredUser>();
let _initialized = false;

function init() {
  if (_initialized) return;
  _initialized = true;

  // Mot de passe temporaire unique pour tous les comptes DSI.
  // Chaque utilisateur est forcé de le changer à la première connexion.
  const initialPassword =
    process.env.INITIAL_DSI_PASSWORD ?? "DSI@MaisonsAlfort2026!";

  // Un seul hashage pour tous les comptes (même mot de passe initial)
  const sharedHash = bcrypt.hashSync(initialPassword, 12);

  for (const member of DSI_MEMBERS) {
    _store.set(member.id, {
      ...member,
      department: "Direction des Systèmes d'Information",
      passwordHash: sharedHash,
      isActive: true,
      mustChangePassword: true,
      createdAt: "2026-01-15T10:00:00Z",
      createdBy: "système",
      failedLoginAttempts: 0,
    });
  }
}

// ─── Journal d'audit en mémoire ────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
}

const _auditLog: AuditEntry[] = [];
let _auditCounter = 0;

export function addAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp">
): void {
  _auditLog.unshift({
    id: `audit-${++_auditCounter}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  // Conserver seulement les 500 dernières entrées
  if (_auditLog.length > 500) _auditLog.splice(500);
}

export function getAuditLog(): AuditEntry[] {
  return [..._auditLog];
}

// ─── Accesseurs ───────────────────────────────────────────────────────────────

export function getUsers(): StoredUser[] {
  init();
  return Array.from(_store.values());
}

export function getUserByEmail(email: string): StoredUser | undefined {
  init();
  return Array.from(_store.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function getUserById(id: string): StoredUser | undefined {
  init();
  return _store.get(id);
}

export function createUser(
  data: Omit<StoredUser, "id" | "createdAt">
): StoredUser {
  init();
  const id = `usr-${Date.now()}`;
  const user: StoredUser = { ...data, id, createdAt: new Date().toISOString() };
  _store.set(id, user);
  return user;
}

export function updateUser(
  id: string,
  data: Partial<StoredUser>
): StoredUser | null {
  init();
  const user = _store.get(id);
  if (!user) return null;
  const updated = { ...user, ...data };
  _store.set(id, updated);
  return updated;
}

export function deleteUser(id: string): boolean {
  init();
  // Interdit la suppression des comptes DSI système
  if (id.startsWith("dsi-")) return false;
  return _store.delete(id);
}

// ─── Verrouillage de compte ────────────────────────────────────────────────────

export function recordFailedLogin(id: string): void {
  init();
  const user = _store.get(id);
  if (!user) return;
  const attempts = (user.failedLoginAttempts ?? 0) + 1;
  const updates: Partial<StoredUser> = { failedLoginAttempts: attempts };
  // Verrouillage progressif : 5 tentatives → 30 min, 10 → 2h
  if (attempts >= 10) {
    updates.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  } else if (attempts >= 5) {
    updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }
  _store.set(id, { ...user, ...updates });
}

export function recordSuccessfulLogin(id: string): void {
  init();
  const user = _store.get(id);
  if (!user) return;
  _store.set(id, {
    ...user,
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    lastLogin: new Date().toISOString(),
  });
}

export function isAccountLocked(user: StoredUser): boolean {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}
