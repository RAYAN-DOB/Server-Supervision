import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const media = await prisma.media.findMany({
      where: { siteId: id },
      orderBy: { createdAt: "asc" },
      include: {
        local: { select: { id: true, name: true } },
        bay: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[API] GET /api/v1/sites/[id]/media error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des médias" },
      { status: 500 }
    );
  }
}
