import { NextResponse } from "next/server";
import { MOCK_ALERTS } from "@/data/mock-sites";

export async function GET() {
  // Mock Zabbix triggers endpoint
  // In production, this would fetch from real Zabbix API
  
  return NextResponse.json({
    triggers: MOCK_ALERTS.map(alert => ({
      triggerid: alert.id,
      description: alert.title,
      priority: alert.severity === "critical" ? "5" : alert.severity === "major" ? "4" : "2",
      lastchange: Math.floor(new Date(alert.timestamp).getTime() / 1000).toString(),
      value: alert.acknowledged ? "0" : "1",
      hosts: [
        {
          hostid: alert.siteId,
          name: alert.siteName,
        },
      ],
    })),
  });
}
