import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");

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
    console.warn("[API] media indisponible, fallback galerie vide:", error);
    return NextResponse.json({ media: [], fallback: true });
  }
}
