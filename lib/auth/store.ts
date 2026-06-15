/**
 * Stockage des utilisateurs en memoire cote serveur.
 *
 * Tous les membres de la DSI de Maisons-Alfort sont pre-configures avec
 * un mot de passe temporaire defini par INITIAL_DSI_PASSWORD.
 * Le flag mustChangePassword=true force le changement a la premiere connexion.
 *
 * Attention Persistance : ce store est en memoire. En serverless (Vercel Functions),
 *   les comptes crees dynamiquement sont perdus au cold start. Les 9 comptes
 *   DSI sont recrees a chaque demarrage depuis les constantes ci-dessous.
 */

import bcrypt from "bcryptjs";

// Les 4 rôles possibles, du plus au moins privilégié (utilisés pour les droits d'accès).
export type UserRole = "super_admin" | "admin" | "tech" | "viewer";

// Forme complète d'un utilisateur stocké (inclut le hash du mot de passe et l'état du compte).
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

// --- Membres DSI de Maisons-Alfort --------------------------------------------

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

// --- Store module-level (partage dans un meme processus Node.js) -------------

// Map des utilisateurs indexée par id + drapeau pour ne créer les comptes qu'une seule fois.
const _store = new Map<string, StoredUser>();
let _initialized = false;

// Initialisation paresseuse : crée les 9 comptes DSI au premier accès (lazy init).
function init() {
  if (_initialized) return; // Déjà fait : on ne recrée pas les comptes.
  _initialized = true;

  // Mot de passe temporaire fourni par INITIAL_DSI_PASSWORD (aucun secret réel dans le code).
  const initialPassword =
    process.env.INITIAL_DSI_PASSWORD ?? "AURION-LAB-ONLY-CHANGE-ME!";
  // Si aucun mot de passe n'est fourni, on force son changement à la 1re connexion.
  const mustChangePassword = !process.env.INITIAL_DSI_PASSWORD;

  // On hache le mot de passe une seule fois avec bcrypt (coût 12) ; jamais stocké en clair.
  const sharedHash = bcrypt.hashSync(initialPassword, 12);

  // Création de chaque membre DSI à partir des constantes ci-dessus.
  for (const member of DSI_MEMBERS) {
    _store.set(member.id, {
      ...member,
      department: "Direction des Systemes d'Information",
      passwordHash: sharedHash,
      isActive: true,
      mustChangePassword,
      createdAt: "2026-01-15T10:00:00Z",
      createdBy: "systeme",
      failedLoginAttempts: 0,
    });
  }
}

// --- Journal d'audit en memoire ------------------------------------------------

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
}

// Journal d'audit + compteur pour générer des identifiants uniques.
const _auditLog: AuditEntry[] = [];
let _auditCounter = 0;

// Ajoute une action au journal (connexion, modification, etc.) avec id et horodatage automatiques.
export function addAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp">
): void {
  // unshift : on insère en tête pour avoir les entrées les plus récentes en premier.
  _auditLog.unshift({
    id: `audit-${++_auditCounter}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  // Conserver seulement les 500 dernieres entrees
  if (_auditLog.length > 500) _auditLog.splice(500);
}

export function getAuditLog(): AuditEntry[] {
  return [..._auditLog];
}

// --- Accesseurs ---------------------------------------------------------------

// Renvoie tous les utilisateurs (init() garantit que les comptes DSI existent).
export function getUsers(): StoredUser[] {
  init();
  return Array.from(_store.values());
}

// Recherche par email, insensible à la casse (utilisé lors du login).
export function getUserByEmail(email: string): StoredUser | undefined {
  init();
  return Array.from(_store.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

// Recherche directe par identifiant.
export function getUserById(id: string): StoredUser | undefined {
  init();
  return _store.get(id);
}

// Crée un nouvel utilisateur ; l'id est généré à partir de l'horodatage.
export function createUser(
  data: Omit<StoredUser, "id" | "createdAt">
): StoredUser {
  init();
  const id = `usr-${Date.now()}`;
  const user: StoredUser = { ...data, id, createdAt: new Date().toISOString() };
  _store.set(id, user);
  return user;
}

// Met à jour partiellement un utilisateur (fusion des champs fournis avec l'existant).
export function updateUser(
  id: string,
  data: Partial<StoredUser>
): StoredUser | null {
  init();
  const user = _store.get(id);
  if (!user) return null; // Utilisateur inconnu.
  const updated = { ...user, ...data }; // Les champs de data écrasent ceux de user.
  _store.set(id, updated);
  return updated;
}

// Supprime un utilisateur, sauf les comptes DSI système (protégés).
export function deleteUser(id: string): boolean {
  init();
  // Interdit la suppression des comptes DSI systeme
  if (id.startsWith("dsi-")) return false;
  return _store.delete(id);
}

// --- Verrouillage de compte ----------------------------------------------------

// Enregistre un échec de connexion et verrouille le compte si trop d'échecs.
export function recordFailedLogin(id: string): void {
  init();
  const user = _store.get(id);
  if (!user) return;
  const attempts = (user.failedLoginAttempts ?? 0) + 1; // Incrément du compteur d'échecs.
  const updates: Partial<StoredUser> = { failedLoginAttempts: attempts };
  // Verrouillage progressif : 5 tentatives -> 30 min, 10 -> 2h
  if (attempts >= 10) {
    updates.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  } else if (attempts >= 5) {
    updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }
  _store.set(id, { ...user, ...updates });
}

// Connexion réussie : on remet à zéro les échecs, on déverrouille et on note la date.
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

// Vrai si le compte est actuellement verrouillé (date de déverrouillage encore dans le futur).
export function isAccountLocked(user: StoredUser): boolean {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

