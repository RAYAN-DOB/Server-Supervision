import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserById } from "@/lib/auth/store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("aurion-token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Rafraîchir depuis le store pour avoir les données à jour
  const user = getUserById(payload.id);

  if (!user || !user.isActive) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      lastLogin: user.lastLogin,
    },
  });
}
