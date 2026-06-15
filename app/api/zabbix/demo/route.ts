/**
 * Route API : GET /api/zabbix/demo
 *
 * Rôle dans AURION : vue de démonstration du site "Lab Black Box" (DEMO-LAB).
 * Elle lit dans Zabbix les capteurs (température, humidité, eau, fumée, courant,
 * disponibilité) du host Black Box, les classe/filtre, en déduit un statut et
 * des alertes, puis renvoie un payload complet (site, capteurs, alertes, checks).
 * Si Zabbix est indisponible, renvoie un payload mock équivalent.
 */
import { NextResponse } from "next/server";
import { MOCK_ALERTS, MOCK_SITES } from "@/data/mocks";
import { getZabbixClient, getZabbixStatus, mapZabbixTriggerToAlert } from "@/lib/zabbix/client";
import type { Alert, Severity, SiteStatus } from "@/types";

// force-dynamic : empêche Next.js de mettre la réponse en cache, on veut
// toujours des valeurs fraîches à chaque appel (supervision temps réel).
export const dynamic = "force-dynamic";

type DemoSensorType = "temperature" | "humidity" | "water" | "smoke" | "power" | "availability" | "other";

interface DemoSensor {
  id: string;
  name: string;
  type: DemoSensorType;
  value: string;
  numericValue?: number;
  unit: string;
  status: SiteStatus;
  lastUpdate: string;
  source: "zabbix" | "mock";
  zabbixItemId?: string;
  oidOrKey?: string;
}

interface DemoCheck {
  label: string;
  status: "ok" | "warning" | "critical";
  detail: string;
}

// Identifiant logique du site de démo côté AURION.
const DEMO_SITE_ID = "DEMO-LAB";
// Noms de hosts possibles pour la Black Box dans Zabbix : on en teste plusieurs
// car le host a pu être nommé différemment selon l'environnement.
const DEFAULT_DEMO_HOSTS = [
  "SP01C5B0",
  "SERVSENSOR",
  "SERVSENSORX",
  "BLACKBOX",
  "BLACKBOX-DEMO-LAB",
  "BLACKBOX-DEMO",
  "DEMO-LAB",
  "BLACKBOX-LAB",
  "BLACKBOX-HTDV",
  "BLACKBOX-PLDS",
];

// Construit la liste des noms de host à chercher : d'abord ceux configurés via
// la variable d'env ZABBIX_DEMO_HOST_NAME (séparés par des virgules), puis la
// liste par défaut. Tout est mis en minuscules pour une comparaison insensible à la casse.
function getDemoHostCandidates() {
  const configured = process.env.ZABBIX_DEMO_HOST_NAME
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? [];
  return [...configured, ...DEFAULT_DEMO_HOSTS].map((v) => v.toLowerCase());
}

// Convertit un timestamp Unix Zabbix (secondes) en date ISO.
// Sécurité : si la valeur est absente ou invalide, on renvoie l'heure actuelle.
function formatClock(clock?: string | number) {
  const unix = Number(clock);
  if (!Number.isFinite(unix) || unix <= 0) return new Date().toISOString();
  return new Date(unix * 1000).toISOString();
}

// Devine le TYPE d'un capteur à partir de son libellé/clé/unité Zabbix.
// On concatène nom + key_ + units, et on cherche des mots-clés (FR et EN).
function classifySensor(item: any): DemoSensorType {
  const text = `${item.name ?? ""} ${item.key_ ?? ""} ${item.units ?? ""}`.toLowerCase();
  if (text.includes("status") || text.includes("etat")) return "availability";
  if (text.includes("temp") || text.includes("celsius")) return "temperature";
  if (text.includes("hum") || text.includes("%hr") || text.includes("humidity")) return "humidity";
  if (text.includes("water") || text.includes("eau") || text.includes("leak")) return "water";
  if (text.includes("smoke") || text.includes("fum")) return "smoke";
  if (text.includes("volt") || text.includes("ac voltage") || text.includes("power") || text.includes("tension")) return "power";
  if (text.includes("available") || text.includes("icmpping") || text.includes("snmp") || text.includes("uptime")) return "availability";
  return "other";
}

// Filtre : garde-t-on cet item comme une vraie MESURE à afficher ?
// But : écarter les items de configuration (seuils, calibration...) et ne
// conserver que les valeurs réellement mesurées, dans des plages plausibles.
function isMeasurementItem(item: any, type: DemoSensorType) {
  const text = `${item.name ?? ""} ${item.key_ ?? ""}`.toLowerCase();
  const numericValue = Number(item.lastvalue);

  // On exclut les items de paramétrage (seuils haut/bas, rearm, calibration...)
  // qui ne sont pas des mesures à présenter à l'utilisateur.
  if (
    text.includes("threshold") ||
    text.includes("seuil") ||
    text.includes("low warning") ||
    text.includes("high warning") ||
    text.includes("low critical") ||
    text.includes("high critical") ||
    text.includes("rearm") ||
    text.includes("calibration") ||
    text.includes("graph enable") ||
    text.includes("filter status")
  ) {
    return false;
  }

  // Température : on ne garde que des valeurs physiquement réalistes (-20..80 °C).
  if (type === "temperature") {
    return Number.isFinite(numericValue) && numericValue > -20 && numericValue < 80;
  }
  // Humidité : valeur en pourcentage, donc bornée 0..100.
  if (type === "humidity") {
    return Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 100;
  }
  // Disponibilité : on veut un item de type ping/joignabilité, pas une mesure chiffrée.
  if (type === "availability") {
    return text.includes("icmpping") || text.includes("available") || text.includes("snmp");
  }

  return true;
}

// Détermine l'état (ok/warning/critical) d'un capteur selon des SEUILS métier.
// C'est ici que la "supervision" prend du sens : on compare la mesure aux limites.
function statusForSensor(type: DemoSensorType, rawValue: string, numericValue?: number): SiteStatus {
  if (numericValue == null || Number.isNaN(numericValue)) return "ok";

  // Température salle serveur : alerte à 27 °C, critique à 30 °C.
  if (type === "temperature") {
    if (numericValue >= 30) return "critical";
    if (numericValue >= 27) return "warning";
  }
  // Humidité : alerte à 60 %, critique à 75 %.
  if (type === "humidity") {
    if (numericValue >= 75) return "critical";
    if (numericValue >= 60) return "warning";
  }
  // Eau ou fumée : toute détection (>0 ou libellé d'alarme) est critique.
  if (type === "water" || type === "smoke") {
    const normalized = rawValue.toLowerCase();
    if (numericValue > 0 || normalized.includes("alarm") || normalized.includes("alerte")) return "critical";
  }
  // Alimentation : tension à 0 = coupure de courant = critique.
  if (type === "power" && numericValue === 0) return "critical";

  return "ok";
}

// Donne un nom lisible et homogène à afficher selon le type de capteur,
// indépendamment du libellé technique brut renvoyé par Zabbix.
function displayNameForSensor(type: DemoSensorType, fallback?: string) {
  switch (type) {
    case "temperature":
      return "Température capteur Black Box";
    case "humidity":
      return "Humidité capteur Black Box";
    case "power":
      return "Tension AC";
    case "water":
      return "Détection d'eau";
    case "smoke":
      return "Détection fumée";
    case "availability":
      return "Disponibilité SNMPv3";
    default:
      return fallback ?? "Item Zabbix";
  }
}

// Transforme un item Zabbix brut en un objet "DemoSensor" prêt à afficher :
// type deviné, valeur formatée, unité, statut calculé, date de dernière mesure.
function mapItemToSensor(item: any): DemoSensor {
  const type = classifySensor(item);
  const numericValue = Number(item.lastvalue);
  const isNumber = Number.isFinite(numericValue);
  // Normalisation de l'unité : "C" devient "°C" ; sinon on déduit selon le type.
  const unit = item.units === "C" ? "°C" : item.units || (type === "temperature" ? "°C" : type === "humidity" ? "%" : "");
  // Mise en forme de la valeur affichée :
  // - disponibilité numérique -> texte "joignable"
  // - nombre -> arrondi à 1 décimale + unité
  // - sinon -> valeur brute ou "n/a"
  const value = type === "availability" && isNumber
    ? "joignable"
    : isNumber
    ? `${Math.round(numericValue * 10) / 10}${unit ? ` ${unit}` : ""}`
    : String(item.lastvalue ?? "n/a");

  return {
    id: item.itemid ?? item.key_ ?? item.name,
    name: displayNameForSensor(type, item.name ?? item.key_),
    type,
    value,
    numericValue: isNumber ? numericValue : undefined,
    unit,
    status: statusForSensor(type, String(item.lastvalue ?? ""), isNumber ? numericValue : undefined),
    lastUpdate: formatClock(item.lastclock),
    source: "zabbix",
    zabbixItemId: item.itemid,
    oidOrKey: item.key_,
  };
}

// Jeu de capteurs factices utilisé quand Zabbix n'est pas joignable, pour que
// la page de démo reste présentable (valeurs réalistes et statut "ok").
function mockSensors(): DemoSensor[] {
  const now = new Date().toISOString();
  const temp = 22.8;
  const humidity = 53;

  return [
    {
      id: "mock-temp",
      name: "Température capteur Black Box",
      type: "temperature",
      value: `${temp} °C`,
      numericValue: temp,
      unit: "°C",
      status: statusForSensor("temperature", String(temp), temp),
      lastUpdate: now,
      source: "mock",
      oidOrKey: "snmp.blackbox.demo.temperature",
    },
    {
      id: "mock-humidity",
      name: "Humidité capteur Black Box",
      type: "humidity",
      value: `${humidity} %`,
      numericValue: humidity,
      unit: "%",
      status: statusForSensor("humidity", String(humidity), humidity),
      lastUpdate: now,
      source: "mock",
      oidOrKey: "snmp.blackbox.demo.humidity",
    },
    {
      id: "mock-power",
      name: "Tension AC",
      type: "power",
      value: "présente",
      numericValue: 1,
      unit: "",
      status: "ok",
      lastUpdate: now,
      source: "mock",
      oidOrKey: "snmp.blackbox.demo.ac",
    },
    {
      id: "mock-snmp",
      name: "Disponibilité SNMPv3",
      type: "availability",
      value: "joignable",
      numericValue: 1,
      unit: "",
      status: "ok",
      lastUpdate: now,
      source: "mock",
      oidOrKey: "icmpping",
    },
  ];
}

// Construit la liste de "vérifications" (checks) affichée comme un diagnostic :
// API Zabbix, host trouvé, items exploitables, triggers actifs, sécurité.
// Chaque check a un statut (ok/warning/critical) et un détail explicatif.
function buildChecks(params: {
  connected: boolean;
  useMock: boolean;
  hostFound: boolean;
  sensorsCount: number;
  triggersCount: number;
  error?: string;
}): DemoCheck[] {
  return [
    {
      label: "API Zabbix",
      status: params.connected ? "ok" : "warning",
      detail: params.connected ? "Connexion JSON-RPC active" : "Valeurs de secours affichées",
    },
    {
      label: "Host Lab Black Box",
      status: params.hostFound ? "ok" : params.useMock ? "warning" : "critical",
      detail: params.hostFound ? "Host trouvé dans Zabbix" : "Host non trouvé, valeurs de secours affichées",
    },
    {
      label: "Items SNMP/OID",
      status: params.sensorsCount > 0 ? "ok" : "warning",
      detail: `${params.sensorsCount} valeur(s) exploitable(s)`,
    },
    {
      label: "Triggers Zabbix",
      status: params.triggersCount > 0 ? "warning" : "ok",
      detail: params.triggersCount > 0 ? `${params.triggersCount} trigger(s) actif(s)` : "Aucun problème actif",
    },
    {
      label: "Sécurité",
      status: "ok",
      detail: "Token API côté serveur uniquement, SNMPv3 authPriv côté supervision",
    },
  ];
}

// Convertit le statut d'un site/capteur en niveau de gravité d'alerte.
function severityFromStatus(status: SiteStatus): Severity {
  if (status === "critical") return "critical";
  if (status === "warning") return "major";
  return "info";
}

// En mode mock : génère des alertes à partir des capteurs qui ne sont pas "ok".
// Permet de montrer une alerte cohérente même sans Zabbix.
function buildMockAlerts(sensors: DemoSensor[]): Alert[] {
  const active = sensors.filter((s) => s.status === "warning" || s.status === "critical");
  if (active.length === 0) return [];

  return active.map((sensor, index) => ({
    id: `demo-live-${sensor.id}-${index}`,
    siteId: DEMO_SITE_ID,
    siteName: "Lab Black Box",
    bayId: "DEMO-LAB-bay-1",
    bayName: "Baie Black Box",
    severity: severityFromStatus(sensor.status),
    title: `${sensor.name} - seuil surveillé`,
    description: `Valeur actuelle remontée sur le site Lab Black Box : ${sensor.value}.`,
    timestamp: sensor.lastUpdate,
    acknowledged: false,
    resolved: false,
    sensorType: sensor.type,
    value: sensor.numericValue,
  }));
}

// Construit la réponse complète en mode secours (mock). Même structure que la
// réponse réelle pour que le front n'ait pas à distinguer les deux cas.
// 'reason' explique pourquoi on est tombé en mock (utile pour le debug).
function mockPayload(reason?: string) {
  const sensors = mockSensors();
  const alerts = buildMockAlerts(sensors);
  const site = MOCK_SITES.find((s) => s.id === DEMO_SITE_ID)!;

  return {
    site,
    source: "mock",
    connected: false,
    useMock: true,
    apiVersion: null,
    zabbixHost: {
      hostid: "demo",
      name: "BLACKBOX-DEMO",
      available: "mock",
    },
    sensors,
    alerts,
    checks: buildChecks({
      connected: false,
      useMock: true,
      hostFound: false,
      sensorsCount: sensors.length,
      triggersCount: alerts.length,
      error: reason,
    }),
    explanation: "Cette vue représente DEMO-LAB comme un site AURION supervisé. Si Zabbix est disponible, les valeurs viennent de l'API JSON-RPC ; sinon des valeurs de secours restent affichées.",
    lastSync: new Date().toISOString(),
    error: reason,
  };
}

export async function GET() {
  const status = await getZabbixStatus();

  // Court-circuit : si Zabbix est en mode mock, on renvoie directement le payload de secours.
  if (status.useMock) {
    return NextResponse.json(mockPayload(status.error));
  }

  try {
    const client = getZabbixClient();
    if (!client) return NextResponse.json(mockPayload("Client Zabbix non initialisé"));

    await client.authenticate();
    // Étape 1 : récupérer tous les hosts puis IDENTIFIER celui de la Black Box.
    const hosts = await client.getHosts();
    const candidates = getDemoHostCandidates();
    const configuredId = process.env.ZABBIX_DEMO_HOST_ID;
    // On reconnaît le host soit par son ID exact configuré, soit si son nom
    // contient l'un des noms candidats (recherche souple).
    const host = hosts.find((h) => {
      const hostId = String(h.hostid ?? "");
      const hostName = String(h.name ?? h.host ?? "").toLowerCase();
      return (configuredId && hostId === configuredId) || candidates.some((candidate) => hostName.includes(candidate));
    });

    // Host introuvable : on retombe en mock avec un message d'aide à la config.
    if (!host) {
      return NextResponse.json(mockPayload("Aucun host Zabbix Lab Black Box trouvé. Configurez ZABBIX_DEMO_HOST_NAME=SP01C5B0, BLACKBOX-DEMO ou ZABBIX_DEMO_HOST_ID."));
    }

    // Étape 2 : en parallèle, lire les items (capteurs) du host et tous les triggers actifs.
    const [items, triggers] = await Promise.all([
      client.getItems(host.hostid),
      client.getTriggers(),
    ]);

    // Étape 3 : transformer chaque item en capteur, puis ne garder que les vraies
    // mesures (on jette les types "other" et les items de configuration).
    const mappedSensors = items
      .map((item) => ({ item, sensor: mapItemToSensor(item) }))
      .filter(({ item, sensor }) => sensor.type !== "other" && isMeasurementItem(item, sensor.type));

    // Étape 4 : ne conserver qu'UN capteur par type, dans un ordre d'affichage
    // imposé. find() prend le premier trouvé pour chaque type ; filter(Boolean) retire les absents.
    const priority: DemoSensorType[] = ["temperature", "humidity", "power", "water", "smoke", "availability"];
    const sensors = priority
      .map((type) => mappedSensors.find(({ sensor }) => sensor.type === type)?.sensor)
      .filter(Boolean) as DemoSensor[];

    // Étape 5 : ne garder que les triggers qui concernent CE host (par id ou nom).
    const hostTriggers = triggers.filter((trigger) =>
      trigger.hosts?.some((h: any) => String(h.hostid) === String(host.hostid) || String(h.name) === String(host.name ?? host.host))
    );

    // Conversion des triggers du host en alertes AURION rattachées au site démo.
    const alerts = hostTriggers.map((trigger) => ({
      ...mapZabbixTriggerToAlert(trigger),
      siteId: DEMO_SITE_ID,
      siteName: "Lab Black Box",
      description: trigger.comments || trigger.description || "Trigger actif remonté par Zabbix.",
      acknowledged: false,
      resolved: false,
    })) as Alert[];

    // Étape 6 : statut global du site déduit des alertes : au moins une critique
    // -> critical ; sinon au moins une alerte -> warning ; sinon ok.
    const siteStatus: SiteStatus = alerts.some((a) => a.severity === "critical")
      ? "critical"
      : alerts.length > 0
        ? "warning"
        : "ok";

    // On part de la fiche site mock et on l'enrichit avec les valeurs live
    // (statut, nb d'alertes, température/humidité du moment).
    const site = {
      ...MOCK_SITES.find((s) => s.id === DEMO_SITE_ID)!,
      status: siteStatus,
      alertCount: alerts.length,
      lastUpdate: new Date().toISOString(),
      temperature: sensors.find((s) => s.type === "temperature")?.numericValue ?? 0,
      humidity: sensors.find((s) => s.type === "humidity")?.numericValue ?? 0,
    };

    // Étape 7 : réponse finale agrégée envoyée au front (site + capteurs + alertes + checks).
    return NextResponse.json({
      site,
      source: "zabbix",
      connected: true,
      useMock: false,
      apiVersion: status.apiVersion,
      zabbixHost: {
        hostid: host.hostid,
        name: host.name ?? host.host,
        available: host.available,
      },
      sensors,
      alerts,
      checks: buildChecks({
        connected: true,
        useMock: false,
        hostFound: true,
        sensorsCount: sensors.length,
        triggersCount: alerts.length,
      }),
      explanation: "Cette vue lit Lab Black Box comme un site AURION réel : host Zabbix, items SNMP/OID, triggers et alertes actives.",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    // Toute erreur (réseau, API, parsing) bascule proprement vers le payload mock
    // en y joignant le message d'erreur, pour ne jamais casser la page de démo.
    return NextResponse.json(mockPayload(error instanceof Error ? error.message : "Erreur Zabbix inconnue"));
  }
}
