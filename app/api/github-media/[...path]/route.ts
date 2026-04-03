import { NextRequest, NextResponse } from "next/server";

const REPO = "RAYAN-DOB/aurion-sites-inventory";
const BRANCH = "main";

const MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  gif:  "image/gif",
  webp: "image/webp",
  pdf:  "application/pdf",
  svg:  "image/svg+xml",
};

// Durée de cache : 7 jours (photos d'inventaire stables)
const CACHE_TTL = 60 * 60 * 24 * 7;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Sécurité : interdire les path traversal
  if (segments.some((s) => s === ".." || s === ".")) {
    return new NextResponse("Chemin invalide", { status: 400 });
  }

  const filePath = segments.map(decodeURIComponent).join("/");
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse("GITHUB_TOKEN non configuré", { status: 500 });
  }

  // Encode chaque segment séparément pour préserver les "/"
  const encodedPath = filePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${BRANCH}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "Server-Supervision-App",
      },
      next: { revalidate: CACHE_TTL },
    });

    if (!res.ok) {
      const status = res.status === 404 ? 404 : res.status >= 500 ? 502 : res.status;
      return new NextResponse(`GitHub: ${res.status} ${res.statusText}`, { status });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_TTL}, stale-while-revalidate=3600, immutable`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[github-media]", err);
    return new NextResponse("Erreur lors du chargement de l'image", { status: 500 });
  }
}
