/**
 * Route API : GET /api/v1/health
 *
 * Rôle dans AURION : "health check" de l'application (sonde de supervision).
 * Vérifie que les couches métier répondent (stats sites + alertes via les
 * use-cases de l'architecture clean) et indique si Zabbix est configuré.
 * Renvoie 200 "healthy" si tout va bien, 503 "degraded" en cas d'erreur.
 */
import { NextResponse } from "next/server";
import { getUseCases } from "@/infrastructure/config/container";

export async function GET() {
  // Horodatage de départ pour mesurer le temps de réponse de la sonde.
  const start = Date.now();

  try {
    // On récupère les use-cases via le conteneur d'injection de dépendances,
    // puis on exécute en parallèle les deux statistiques clés.
    const useCases = getUseCases();
    const [siteStats, alertStats] = await Promise.all([
      useCases.getSiteStats.execute(),
      useCases.getAlertStats.execute(),
    ]);

    const responseTime = Date.now() - start;

    // Réponse "healthy" : version, uptime du process, temps de réponse, et état
    // détaillé de chaque dépendance (repositories + config Zabbix).
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
        // Présence de l'URL Zabbix = simple indicateur de configuration (pas un test de connexion réel).
        zabbix: { status: process.env.ZABBIX_API_URL ? "configured" : "not_configured" },
      },
      stats: {
        sites: siteStats,
        alerts: alertStats,
      },
    });
  } catch (error) {
    // Une couche métier a échoué : on signale l'application comme "degraded"
    // avec un code HTTP 503 (service indisponible) pour les outils de monitoring.
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
