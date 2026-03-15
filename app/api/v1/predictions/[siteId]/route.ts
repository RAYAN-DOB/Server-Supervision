import { NextResponse } from "next/server";
import { getUseCases, getSiteRepository } from "@/infrastructure/config/container";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const siteRepo = getSiteRepository();
    const site = await siteRepo.getById(siteId);
    if (!site) {
      return NextResponse.json({ error: `Site ${siteId} introuvable` }, { status: 404 });
    }

    const useCases = getUseCases();
    const [predictions, anomalies] = await Promise.all([
      useCases.predictFailures.execute(siteId, site.name),
      useCases.detectAnomalies.execute(siteId),
    ]);

    return NextResponse.json({
      siteId,
      siteName: site.name,
      predictions,
      anomalies,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] GET /api/v1/predictions/[siteId] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse prédictive" },
      { status: 500 }
    );
  }
}
