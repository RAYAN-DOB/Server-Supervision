/**
 * Route API : GET /api/zabbix/hosts
 *
 * Rôle dans AURION : expose au front la liste des équipements (hosts) supervisés.
 * Lit Zabbix via le client JSON-RPC, traduit chaque host en "Site" AURION.
 * Si Zabbix est indisponible, renvoie des données mock (drapeau useMock=true)
 * pour que l'interface reste fonctionnelle en démonstration.
 */
import { NextResponse } from "next/server";
import { getZabbixClient, getZabbixStatus, mapZabbixHostToSite } from "@/lib/zabbix/client";
import { MOCK_SITES } from "@/data/mocks";

export async function GET() {
  // On vérifie d'abord l'état de la connexion (et donc s'il faut basculer en mock).
  const status = await getZabbixStatus();

  // Fallback mock si Zabbix non configuré ou connexion échouée
  // On remet les sites factices au format "host Zabbix" pour que le front
  // les traite de la même façon que des vraies données.
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
    // Cas nominal : on authentifie le client puis on lit les hosts réels.
    const client = getZabbixClient()!;
    await client.authenticate();
    const hosts = await client.getHosts();

    // Pour chaque host : on garde les champs bruts (...h) ET on ajoute les
    // champs normalisés AURION (statut, nom) via le mapper.
    return NextResponse.json({
      hosts: hosts.map((h) => ({
        ...h,
        ...mapZabbixHostToSite(h),
        _mock: false,
      })),
      useMock: false,
    });
  } catch (error) {
    // En cas d'erreur réseau/API, on renvoie un message + code 500.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue", useMock: true },
      { status: 500 }
    );
  }
}
