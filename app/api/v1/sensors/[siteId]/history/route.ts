import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { searchParams } = new URL(req.url);
    const sensorType = searchParams.get("type") ?? "temperature";
    const days = parseInt(searchParams.get("days") ?? "7", 10);
    const aggregation = (searchParams.get("aggregation") ?? "hourly") as "raw" | "hourly" | "daily";

    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const useCases = getUseCases();
    const history = await useCases.getSensorHistory.execute(siteId, sensorType, from, now, aggregation);

    return NextResponse.json(history);
  } catch (error) {
    console.error("[API] GET /api/v1/sensors/[siteId]/history error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
