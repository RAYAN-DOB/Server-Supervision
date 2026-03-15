import { NextResponse } from "next/server";
import { getSensorRepository } from "@/infrastructure/config/container";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const repo = getSensorRepository();
    const sensors = await repo.getCurrentReadings(siteId);

    return NextResponse.json({ siteId, sensors, count: sensors.length });
  } catch (error) {
    console.error("[API] GET /api/v1/sensors/[siteId] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des capteurs" },
      { status: 500 }
    );
  }
}
