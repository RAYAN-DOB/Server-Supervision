import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    const siteId = searchParams.get("siteId");

    const useCases = getUseCases();

    if (siteId) {
      const { getAlertRepository } = await import("@/infrastructure/config/container");
      const repo = getAlertRepository();
      const alerts = await repo.getBySite(siteId);
      return NextResponse.json({ alerts, count: alerts.length });
    }

    if (activeOnly) {
      const alerts = await useCases.getActiveAlerts.execute();
      return NextResponse.json({ alerts, count: alerts.length });
    }

    const { getAlertRepository } = await import("@/infrastructure/config/container");
    const repo = getAlertRepository();
    const alerts = await repo.getAll();
    return NextResponse.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error("[API] GET /api/v1/alerts error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes" },
      { status: 500 }
    );
  }
}
