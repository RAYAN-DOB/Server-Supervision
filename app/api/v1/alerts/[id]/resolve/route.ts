import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCases = getUseCases();
    const alert = await useCases.resolveAlert.execute(id);

    return NextResponse.json({ alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[API] POST /api/v1/alerts/[id]/resolve error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
