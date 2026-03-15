import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET() {
  try {
    const useCases = getUseCases();
    const stats = await useCases.getSiteStats.execute();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[API] GET /api/v1/sites/stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
