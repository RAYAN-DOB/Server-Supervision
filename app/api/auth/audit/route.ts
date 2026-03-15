import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getAuditLog } from "@/lib/auth/store";

// GET /api/auth/audit — journal d'audit (super_admin et admin uniquement)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("aurion-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const auth = await verifyToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
  }

  const logs = getAuditLog();
  return NextResponse.json({ logs });
}
