import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixTriggerToAlert } from "@/lib/zabbix/client";
import { MOCK_ALERTS } from "@/data/mocks";

// Route API Next.js appelée sur /api/zabbix/triggers.
// Elle récupère les triggers Zabbix ou renvoie des alertes mock pour la démonstration.
export async function GET() {
  const status = await getZabbixStatus();
  // Vérifie si la connexion Zabbix est disponible.

  if (status.useMock) {
    // Mode secours : transforme les alertes mock en objets proches du format trigger Zabbix.
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
        // priority reprend l'idée des niveaux Zabbix : plus la valeur est haute, plus l'alerte est grave.

        lastchange: Math.floor(new Date(alert.timestamp).getTime() / 1000).toString(),
        // Zabbix utilise souvent des dates au format timestamp Unix.

        value: alert.acknowledged ? "0" : "1",
        // value 1 = problème actif, value 0 = problème non actif ou acquitté dans cette représentation simplifiée.

        hosts: [{ hostid: alert.siteId, name: alert.siteName }],
        _mock: true,
      })),
      useMock: true,
    });
  }

  try {
    const client = getZabbixClient()!;
    // Création du client API Zabbix.

    await client.authenticate();
    // Authentification côté serveur.

    const triggers = await client.getTriggers();
    // Récupération des triggers Zabbix.

    return NextResponse.json({
      triggers: triggers.map((t) => ({
        ...t,
        ...mapZabbixTriggerToAlert(t),
        // Adaptation d'un trigger Zabbix en alerte lisible par AURION.
        _mock: false,
      })),
      useMock: false,
    });
  } catch (error) {
    // Réponse contrôlée en cas d'erreur API.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue", useMock: true },
      { status: 500 }
    );
  }
}
