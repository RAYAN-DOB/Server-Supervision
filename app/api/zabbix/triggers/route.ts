import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixTriggerToAlert } from "@/lib/zabbix/client";
import { MOCK_ALERTS } from "@/data/mock-sites";

export async function GET() {
  const status = await getZabbixStatus();

  // Fallback mock si Zabbix non configuré ou connexion échouée
  if (status.useMock) {
    return NextResponse.json({
      triggers: MOCK_ALERTS.map((alert) => ({
        triggerid: alert.id,
        description: alert.title,
        priority:
          alert.severity === "critical"
            ? "5"
            : alert.severity === "major"
            ? "4"
            : alert.severity === "minor"
            ? "2"
            : "0",
        lastchange: Math.floor(new Date(alert.timestamp).getTime() / 1000).toString(),
        value: alert.acknowledged ? "0" : "1",
        hosts: [{ hostid: alert.siteId, name: alert.siteName }],
        _mock: true,
      })),
      useMock: true,
    });
  }

  try {
    const client = getZabbixClient()!;
    await client.authenticate();
    const triggers = await client.getTriggers();

    return NextResponse.json({
      triggers: triggers.map((t) => ({
        ...t,
        ...mapZabbixTriggerToAlert(t),
        _mock: false,
      })),
      useMock: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue", useMock: true },
      { status: 500 }
    );
  }
}
