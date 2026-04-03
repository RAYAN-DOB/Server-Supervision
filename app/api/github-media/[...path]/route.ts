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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = segments.map(decodeURIComponent).join("/");
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse("GITHUB_TOKEN non configuré", { status: 500 });
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}?ref=${BRANCH}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      return new NextResponse(`GitHub: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[github-media]", err);
    return new NextResponse("Erreur lors du chargement de l'image", { status: 500 });
  }
}
