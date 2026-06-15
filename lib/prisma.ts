// =====================================================================
// FICHIER : lib/prisma.ts
// ROLE DANS AURION : point d'entree unique vers la base de donnees locale
//   (SQLite via Prisma). Toute l'app importe "prisma" depuis ici.
// CE QU'IL FAIT : prepare la base dev.db (cree les tables si besoin a
//   partir des migrations) puis cree un client Prisma reutilisable.
// POURQUOI : l'app tourne en LOCAL sur une VM ; SQLite = base fichier
//   simple, sans serveur a installer. Le client est mis en cache global
//   pour eviter d'ouvrir plusieurs connexions en developpement (hot reload).
// =====================================================================

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Garantit que le schema (les tables) existe dans le fichier SQLite.
// Rejoue les migrations SQL pour creer les tables manquantes au demarrage.
function ensureSchema(dbPath: string) {
  // Dossier contenant les migrations Prisma (un sous-dossier par migration).
  const migDir = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(migDir)) return; // pas de migrations -> rien a faire

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL"); // WAL = meilleures perfs en lecture/ecriture concurrentes

  // On liste les sous-dossiers de migrations (on ignore les fichiers).
  const dirs = fs.readdirSync(migDir).filter(d =>
    fs.statSync(path.join(migDir, d)).isDirectory()
  );

  for (const dir of dirs) {
    // Chaque migration contient un fichier migration.sql a executer.
    const sqlFile = path.join(migDir, dir, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;
    const sql = fs.readFileSync(sqlFile, "utf-8");
    // On decoupe le fichier en instructions SQL separees par ";".
    const stmts = sql.split(";").filter(s => s.trim().length > 0);
    for (const stmt of stmts) {
      // On execute chaque instruction ; on ignore l'erreur si la table existe deja
      // (le schema peut etre partiellement present apres un demarrage precedent).
      try { db.exec(stmt + ";"); } catch { /* already exists */ }
    }
  }
  db.close(); // on referme cette connexion brute, le client Prisma rouvrira la sienne
}

// Cree le client Prisma branche sur le fichier SQLite local dev.db.
function createClient() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db"); // chemin du fichier base
  ensureSchema(dbPath); // on s'assure que les tables existent avant toute requete
  const adapter = new PrismaBetterSqlite3({ url: dbPath }); // adaptateur SQLite pour Prisma
  return new PrismaClient({ adapter });
}

// Objet global typite pour y stocker l'instance Prisma reutilisable.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Singleton : on reutilise le client deja cree, sinon on en cree un.
// Evite de multiplier les connexions a chaque rechargement de module.
export const prisma = globalForPrisma.prisma ?? createClient();

// En developpement (hot reload), on memorise le client dans le global.
// En production on ne le fait pas (un seul processus stable, pas de hot reload).
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
