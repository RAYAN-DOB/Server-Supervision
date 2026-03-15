import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supervised = searchParams.get("supervised") === "true";

    const useCases = getUseCases();

    if (supervised) {
      const sites = await useCases.getAllSites.execute();
      const supervisedSites = sites.filter(s => s.blackboxInstalled);
      return NextResponse.json({ sites: supervisedSites, count: supervisedSites.length });
    }

    const sites = await useCases.getAllSites.execute();
    return NextResponse.json({ sites, count: sites.length });
  } catch (error) {
    console.error("[API] GET /api/v1/sites error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sites" },
      { status: 500 }
    );
  }
}
