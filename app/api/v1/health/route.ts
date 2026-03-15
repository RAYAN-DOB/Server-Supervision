import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET() {
  const start = Date.now();

  try {
    const useCases = getUseCases();
    const [siteStats, alertStats] = await Promise.all([
      useCases.getSiteStats.execute(),
      useCases.getAlertStats.execute(),
    ]);

    const responseTime = Date.now() - start;

    return NextResponse.json({
      status: "healthy",
      version: "2.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        siteRepository: { status: "ok", count: siteStats.total },
        alertRepository: { status: "ok", active: alertStats.active },
        sensorRepository: { status: "ok" },
        zabbix: { status: process.env.ZABBIX_API_URL ? "configured" : "not_configured" },
      },
      stats: {
        sites: siteStats,
        alerts: alertStats,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - start;
    return NextResponse.json({
      status: "degraded",
      version: "2.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 503 });
  }
}
