import { NextResponse } from "next/server";

export async function GET() {
  // Mock Zabbix API status
  // In production, this would check the real Zabbix API connection
  
  return NextResponse.json({
    connected: true,
    apiVersion: "6.0.0",
    lastSync: new Date().toISOString(),
    hostsCount: 12,
    itemsCount: 156,
    triggersActive: 5,
  });
}
