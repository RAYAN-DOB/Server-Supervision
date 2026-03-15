import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixHostToSite } from "@/lib/zabbix/client";
import { MOCK_SITES } from "@/data/mock-sites";

export async function GET() {
  const status = await getZabbixStatus();

  // Fallback mock si Zabbix non configuré ou connexion échouée
  if (status.useMock) {
    return NextResponse.json({
      hosts: MOCK_SITES.map((site) => ({
        hostid: site.id,
        name: site.name,
        status: site.status,
        available: site.status === "ok" ? "1" : "2",
        interfaces: [{ ip: "192.168.1.1", port: "10050" }],
        _mock: true,
      })),
      useMock: true,
    });
  }

  try {
    const client = getZabbixClient()!;
    await client.authenticate();
    const hosts = await client.getHosts();

    return NextResponse.json({
      hosts: hosts.map((h) => ({
        ...h,
        ...mapZabbixHostToSite(h),
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
