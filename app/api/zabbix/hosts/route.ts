import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixHostToSite } from "@/lib/zabbix/client";
import { MOCK_SITES } from "@/data/mocks";

// Route API Next.js appelée sur /api/zabbix/hosts.
// Elle récupère les hosts depuis Zabbix ou renvoie des données de démonstration.
export async function GET() {
  const status = await getZabbixStatus();
  // Vérifie si la connexion Zabbix est disponible.

  if (status.useMock) {
    // Mode secours : transforme les sites mock en objets proches du format Zabbix.
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
    // Création du client API Zabbix.

    await client.authenticate();
    // Authentification côté serveur.

    const hosts = await client.getHosts();
    // Récupération des hosts Zabbix.

    return NextResponse.json({
      hosts: hosts.map((h) => ({
        ...h,
        ...mapZabbixHostToSite(h),
        // Adaptation des données Zabbix au format utilisé par AURION.
        _mock: false,
      })),
      useMock: false,
    });
  } catch (error) {
    // Réponse contrôlée en cas d'erreur.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue", useMock: true },
      { status: 500 }
    );
  }
}
