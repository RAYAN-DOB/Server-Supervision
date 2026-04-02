/**
 * GET /api/media/[...path]
 * Proxy sécurisé pour servir les images du dépôt aurion-sites-inventory
 * sans les copier dans /public (évite d'alourdir le dépôt AURION).
 *
 * Le dossier racine est configuré via la variable d'environnement INVENTORY_PATH.
 * Défaut : /home/ubuntu/aurion-sites-inventory
 */

import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const INVENTORY_ROOT =
  process.env.INVENTORY_PATH ?? "/home/ubuntu/aurion-sites-inventory";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

const ALLOWED_EXTS = new Set(Object.keys(MIME));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    // Reconstruire le chemin relatif (déjà URL-décodé par Next.js)
    const relPath = segments.join(path.sep);

    // Sécurité : interdire la traversée de répertoire
    const normalized = path.normalize(relPath);
    if (normalized.includes("..") || path.isAbsolute(normalized)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Vérifier l'extension
    const ext = path.extname(normalized).toLowerCase();
    if (!ALLOWED_EXTS.has(ext)) {
      return new NextResponse("Type de fichier non supporté", { status: 400 });
    }

    // Construire le chemin complet et vérifier qu'il reste dans INVENTORY_ROOT
    const fullPath = path.join(INVENTORY_ROOT, normalized);
    const resolvedFull = path.resolve(fullPath);
    const resolvedRoot = path.resolve(INVENTORY_ROOT);
    if (!resolvedFull.startsWith(resolvedRoot + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(fullPath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Lire et renvoyer le fichier
    const buffer = fs.readFileSync(fullPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[API] GET /api/media error:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
