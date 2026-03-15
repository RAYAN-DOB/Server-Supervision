import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCases = getUseCases();
    const data = await useCases.getSiteData.execute(id);

    if (!data) {
      return NextResponse.json({ error: `Site ${id} introuvable` }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] GET /api/v1/sites/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du site" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const useCases = getUseCases();

    const { getSiteData, ...container } = getUseCases();
    const site = await getSiteData.execute(id);
    if (!site) {
      return NextResponse.json({ error: `Site ${id} introuvable` }, { status: 404 });
    }

    const { getSiteRepository } = await import("@/infrastructure/config/container");
    const repo = getSiteRepository();
    const updated = await repo.update(id, body);

    return NextResponse.json({ site: updated });
  } catch (error) {
    console.error("[API] PATCH /api/v1/sites/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du site" },
      { status: 500 }
    );
  }
}
