import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET() {
  try {
    const useCases = getUseCases();
    const stats = await useCases.getAlertStats.execute();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[API] GET /api/v1/alerts/stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des stats alertes" },
      { status: 500 }
    );
  }
}
