import { NextResponse } from "next/server";

const REPO = "RAYAN-DOB/aurion-sites-inventory";
const BRANCH = "main";

async function ghFetch(path: string, token: string) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Server-Supervision-App",
    },
    cache: "no-store",
  });
  return res;
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN non configuré" }, { status: 500 });
  }

  try {
    // Liste la racine du dépôt
    const rootRes = await ghFetch("", token);
    if (!rootRes.ok) {
      return NextResponse.json({
        error: `GitHub root: ${rootRes.status} ${rootRes.statusText}`,
        hint: "Vérifier que GITHUB_TOKEN a le scope 'repo' et accès à aurion-sites-inventory",
      }, { status: rootRes.status });
    }

    const rootItems: { name: string; type: string }[] = await rootRes.json();
    const folders = rootItems.filter((i) => i.type === "dir").map((i) => i.name);

    // Test d'accès à une image HTDV
    const htdvCandidate = "Hotel de local (HTDV)/Salle Serveurs/LT - 01/IMG20250820121342.jpg";
    const encodedHtdv = htdvCandidate.split("/").map(encodeURIComponent).join("/");
    const imgRes = await ghFetch(encodedHtdv, token);

    return NextResponse.json({
      token_ok: true,
      root_folders: folders,
      htdv_test: {
        path: htdvCandidate,
        status: imgRes.status,
        ok: imgRes.ok,
        hint: imgRes.ok
          ? "Chemin HTDV correct ✓"
          : "Chemin HTDV introuvable — vérifier le nom exact du dossier ci-dessus",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
