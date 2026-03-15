import { NextResponse } from "next/server";
import { getSensorRepository } from "@/infrastructure/config/container";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const repo = getSensorRepository();
    const bays = await repo.getBaysForSite(siteId);

    return NextResponse.json({ siteId, bays, count: bays.length });
  } catch (error) {
    console.error("[API] GET /api/v1/sensors/[siteId]/bays error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des baies" },
      { status: 500 }
    );
  }
}
