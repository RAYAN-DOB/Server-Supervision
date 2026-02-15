import { NextResponse } from "next/server";
import { MOCK_SITES } from "@/data/mock-sites";

export async function GET() {
  // Mock Zabbix hosts endpoint
  // In production, this would fetch from real Zabbix API
  
  return NextResponse.json({
    hosts: MOCK_SITES.map(site => ({
      hostid: site.id,
      name: site.name,
      status: site.status,
      interfaces: [
        {
          ip: "192.168.1." + Math.floor(Math.random() * 255),
          port: "10050",
        },
      ],
    })),
  });
}
