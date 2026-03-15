import { NextResponse } from "next/server";
import { getZabbixStatus } from "@/lib/zabbix/client";

export async function GET() {
  const status = await getZabbixStatus();
  return NextResponse.json(status);
}
