import { NextRequest, NextResponse } from "next/server";
import { verifyToken, blacklistToken } from "@/lib/auth/jwt";
import { addAuditEntry } from "@/lib/auth/store";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("aurion-token")?.value;

  // Invalider le JWT dans la blacklist si présent et valide
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.jti) {
      blacklistToken(payload.jti, payload.exp);

      addAuditEntry({
        userId: payload.id,
        userName: payload.name,
        action: "Déconnexion",
        details: "Session terminée par l'utilisateur",
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          undefined,
      });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("aurion-token");
  response.cookies.delete("aurion-user");
  return response;
}
