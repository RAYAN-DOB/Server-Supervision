import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const userName = body.userName ?? "Système";

    const useCases = getUseCases();
    const alert = await useCases.acknowledgeAlert.execute(id, userName);

    return NextResponse.json({ alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[API] POST /api/v1/alerts/[id]/acknowledge error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
