import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

function ensureSchema(dbPath: string) {
  const migDir = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(migDir)) return;

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const dirs = fs.readdirSync(migDir).filter(d =>
    fs.statSync(path.join(migDir, d)).isDirectory()
  );

  for (const dir of dirs) {
    const sqlFile = path.join(migDir, dir, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;
    const sql = fs.readFileSync(sqlFile, "utf-8");
    const stmts = sql.split(";").filter(s => s.trim().length > 0);
    for (const stmt of stmts) {
      try { db.exec(stmt + ";"); } catch { /* already exists */ }
    }
  }
  db.close();
}

function createClient() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  ensureSchema(dbPath);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
