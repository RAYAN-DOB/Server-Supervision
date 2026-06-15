/**
 * Route API : GET /api/zabbix/triggers
 *
 * Rôle dans AURION : fournit au front les alertes actives (triggers en PROBLEM).
 * Lit Zabbix, traduit chaque trigger en "Alert" AURION. Repli mock si Zabbix
 * est indisponible, en reconstituant des triggers factices à partir des alertes mock.
 */
import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixTriggerToAlert } from "@/lib/zabbix/client";
import { MOCK_ALERTS } from "@/data/mocks";

export async function GET() {
  const status = await getZabbixStatus();

  // Fallback mock si Zabbix non configuré ou connexion échouée
  // On fait le chemin inverse du mapper : on retransforme les alertes AURION
  // en triggers "façon Zabbix" pour que le front reçoive un format homogène.
  if (status.useMock) {
    return NextResponse.json({
      triggers: MOCK_ALERTS.map((alert) => ({
        triggerid: alert.id,
        description: alert.title,
        // Conversion gravité AURION -> code priorité Zabbix (5/4/2/0).
        priority:
          alert.severity === "critical"
            ? "5"
            : alert.severity === "major"
            ? "4"
            : alert.severity === "minor"
            ? "2"
            : "0",
        // Date ISO -> timestamp Unix en secondes (format attendu par Zabbix).
        lastchange: Math.floor(new Date(alert.timestamp).getTime() / 1000).toString(),
        // value=1 (PROBLEM) si non acquittée, 0 si acquittée.
        value: alert.acknowledged ? "0" : "1",
        hosts: [{ hostid: alert.siteId, name: alert.siteName }],
        _mock: true,
      })),
      useMock: true,
    });
  }

  try {
    // Cas nominal : récupération des triggers actifs réels depuis Zabbix.
    const client = getZabbixClient()!;
    await client.authenticate();
    const triggers = await client.getTriggers();

    // On combine les champs Zabbix bruts (...t) et les champs AURION normalisés.
    return NextResponse.json({
      triggers: triggers.map((t) => ({
        ...t,
        ...mapZabbixTriggerToAlert(t),
        _mock: false,
      })),
      useMock: false,
    });
  } catch (error) {
    // Erreur Zabbix : message + code HTTP 500.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue", useMock: true },
      { status: 500 }
    );
  }
}
