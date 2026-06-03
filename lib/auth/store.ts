/**
 * Stockage des utilisateurs en mÃ©moire cÃ´tÃ© serveur.
 *
 * Tous les membres de la DSI de Maisons-Alfort sont prÃ©-configurÃ©s avec
 * un mot de passe temporaire dÃ©fini par INITIAL_DSI_PASSWORD.
 * Le flag mustChangePassword=true force le changement Ã  la premiÃ¨re connexion.
 *
 * âš  Persistance : ce store est en mÃ©moire. En serverless (Netlify Functions),
 *   les comptes crÃ©Ã©s dynamiquement sont perdus au cold start. Les 9 comptes
 *   DSI sont recrÃ©Ã©s Ã  chaque dÃ©marrage depuis les constantes ci-dessous.
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

// â”€â”€â”€ Membres DSI de Maisons-Alfort â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Store module-level (partagÃ© dans un mÃªme processus Node.js) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const _store = new Map<string, StoredUser>();
let _initialized = false;

function init() {
  if (_initialized) return;
  _initialized = true;

  // Mot de passe temporaire fourni par INITIAL_DSI_PASSWORD (aucun secret réel dans le code).
  const initialPassword =
    process.env.INITIAL_DSI_PASSWORD ?? "AURION-DEMO-ONLY-CHANGE-ME!";
  const mustChangePassword = !process.env.INITIAL_DSI_PASSWORD;

  const sharedHash = bcrypt.hashSync(initialPassword, 12);

  for (const member of DSI_MEMBERS) {
    _store.set(member.id, {
      ...member,
      department: "Direction des SystÃ¨mes d'Information",
      passwordHash: sharedHash,
      isActive: true,
      mustChangePassword,
      createdAt: "2026-01-15T10:00:00Z",
      createdBy: "systÃ¨me",
      failedLoginAttempts: 0,
    });
  }
}

// â”€â”€â”€ Journal d'audit en mÃ©moire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // Conserver seulement les 500 derniÃ¨res entrÃ©es
  if (_auditLog.length > 500) _auditLog.splice(500);
}

export function getAuditLog(): AuditEntry[] {
  return [..._auditLog];
}

// â”€â”€â”€ Accesseurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // Interdit la suppression des comptes DSI systÃ¨me
  if (id.startsWith("dsi-")) return false;
  return _store.delete(id);
}

// â”€â”€â”€ Verrouillage de compte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function recordFailedLogin(id: string): void {
  init();
  const user = _store.get(id);
  if (!user) return;
  const attempts = (user.failedLoginAttempts ?? 0) + 1;
  const updates: Partial<StoredUser> = { failedLoginAttempts: attempts };
  // Verrouillage progressif : 5 tentatives â†’ 30 min, 10 â†’ 2h
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

