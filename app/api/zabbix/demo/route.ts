import { NextResponse } from "next/server";
import { MOCK_ALERTS, MOCK_SITES } from "@/data/mocks";
import { getZabbixClient, getZabbixStatus, mapZabbixTriggerToAlert } from "@/lib/zabbix/client";
import type { Alert, Severity, SiteStatus } from "@/types";

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

const DEMO_SITE_ID = "DEMO-LAB";
const DEFAULT_DEMO_HOSTS = [
  "BLACKBOX-DEMO-LAB",
  "BLACKBOX-DEMO",
  "DEMO-LAB",
  "BLACKBOX-LAB",
  "BLACKBOX-HTDV",
  "BLACKBOX-PLDS",
];

function getDemoHostCandidates() {
  const configured = process.env.ZABBIX_DEMO_HOST_NAME
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? [];
  return [...configured, ...DEFAULT_DEMO_HOSTS].map((v) => v.toLowerCase());
}

function formatClock(clock?: string | number) {
  const unix = Number(clock);
  if (!Number.isFinite(unix) || unix <= 0) return new Date().toISOString();
  return new Date(unix * 1000).toISOString();
}

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

function statusForSensor(type: DemoSensorType, rawValue: string, numericValue?: number): SiteStatus {
  if (numericValue == null || Number.isNaN(numericValue)) return "ok";

  if (type === "temperature") {
    if (numericValue >= 30) return "critical";
    if (numericValue >= 27) return "warning";
  }
  if (type === "humidity") {
    if (numericValue >= 75) return "critical";
    if (numericValue >= 60) return "warning";
  }
  if (type === "water" || type === "smoke") {
    const normalized = rawValue.toLowerCase();
    if (numericValue > 0 || normalized.includes("alarm") || normalized.includes("alerte")) return "critical";
  }
  if (type === "power" && numericValue === 0) return "critical";

  return "ok";
}

function mapItemToSensor(item: any): DemoSensor {
  const type = classifySensor(item);
  const numericValue = Number(item.lastvalue);
  const isNumber = Number.isFinite(numericValue);
  const unit = item.units === "C" ? "C" : item.units || (type === "temperature" ? "C" : type === "humidity" ? "%" : "");
  const value = type === "availability" && isNumber
    ? "joignable"
    : isNumber
    ? `${Math.round(numericValue * 10) / 10}${unit ? ` ${unit}` : ""}`
    : String(item.lastvalue ?? "n/a");

  return {
    id: item.itemid ?? item.key_ ?? item.name,
    name: item.name ?? item.key_ ?? "Item Zabbix",
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

function mockSensors(): DemoSensor[] {
  const now = new Date().toISOString();
  const temp = +(27.8 + Math.sin(Date.now() / 14000) * 1.2).toFixed(1);
  const humidity = +(48 + Math.cos(Date.now() / 18000) * 3).toFixed(1);

  return [
    {
      id: "mock-temp",
      name: "Temperature capteur Black Box",
      type: "temperature",
      value: `${temp} C`,
      numericValue: temp,
      unit: "C",
      status: statusForSensor("temperature", String(temp), temp),
      lastUpdate: now,
      source: "mock",
      oidOrKey: "snmp.blackbox.demo.temperature",
    },
    {
      id: "mock-humidity",
      name: "Humidite capteur Black Box",
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
      value: "presente",
      numericValue: 1,
      unit: "",
      status: "ok",
      lastUpdate: now,
      source: "mock",
      oidOrKey: "snmp.blackbox.demo.ac",
    },
    {
      id: "mock-snmp",
      name: "Disponibilite SNMPv3",
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
      detail: params.connected ? "Connexion JSON-RPC active" : "Mode laboratoire utilise",
    },
    {
      label: "Host Lab Black Box",
      status: params.hostFound ? "ok" : params.useMock ? "warning" : "critical",
      detail: params.hostFound ? "Host trouve dans Zabbix" : "Host non trouve, donnees laboratoire affichees",
    },
    {
      label: "Items SNMP/OID",
      status: params.sensorsCount > 0 ? "ok" : "warning",
      detail: `${params.sensorsCount} valeur(s) exploitable(s)`,
    },
    {
      label: "Triggers Zabbix",
      status: params.triggersCount > 0 ? "warning" : "ok",
      detail: params.triggersCount > 0 ? `${params.triggersCount} trigger(s) actif(s)` : "Aucun probleme actif",
    },
    {
      label: "Securite",
      status: "ok",
      detail: "Token API cote serveur uniquement, SNMPv3 authPriv cote supervision",
    },
  ];
}

function severityFromStatus(status: SiteStatus): Severity {
  if (status === "critical") return "critical";
  if (status === "warning") return "major";
  return "info";
}

function buildMockAlerts(sensors: DemoSensor[]): Alert[] {
  const active = sensors.filter((s) => s.status === "warning" || s.status === "critical");
  if (active.length === 0) return MOCK_ALERTS.filter((a) => a.siteId === DEMO_SITE_ID);

  return active.map((sensor, index) => ({
    id: `demo-live-${sensor.id}-${index}`,
    siteId: DEMO_SITE_ID,
    siteName: "Lab Black Box",
    bayId: "DEMO-LAB-bay-1",
    bayName: "Baie laboratoire Black Box",
    severity: severityFromStatus(sensor.status),
    title: `${sensor.name} - seuil surveille`,
    description: `Valeur actuelle remontee sur le site laboratoire : ${sensor.value}.`,
    timestamp: sensor.lastUpdate,
    acknowledged: false,
    resolved: false,
    sensorType: sensor.type,
    value: sensor.numericValue,
  }));
}

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
    explanation: "Cette vue represente DEMO-LAB comme un site AURION supervise. Si Zabbix est disponible, les valeurs viennent de l'API JSON-RPC ; sinon le mode laboratoire reste utilisable.",
    lastSync: new Date().toISOString(),
    error: reason,
  };
}

export async function GET() {
  const status = await getZabbixStatus();

  if (status.useMock) {
    return NextResponse.json(mockPayload(status.error));
  }

  try {
    const client = getZabbixClient();
    if (!client) return NextResponse.json(mockPayload("Client Zabbix non initialise"));

    await client.authenticate();
    const hosts = await client.getHosts();
    const candidates = getDemoHostCandidates();
    const configuredId = process.env.ZABBIX_DEMO_HOST_ID;
    const host = hosts.find((h) => {
      const hostId = String(h.hostid ?? "");
      const hostName = String(h.name ?? h.host ?? "").toLowerCase();
      return (configuredId && hostId === configuredId) || candidates.some((candidate) => hostName.includes(candidate));
    });

    if (!host) {
      return NextResponse.json(mockPayload("Aucun host Zabbix de laboratoire trouve. Configurez ZABBIX_DEMO_HOST_NAME=BLACKBOX-DEMO ou ZABBIX_DEMO_HOST_ID."));
    }

    const [items, triggers] = await Promise.all([
      client.getItems(host.hostid),
      client.getTriggers(),
    ]);

    const sensors = items
      .map(mapItemToSensor)
      .filter((sensor) => sensor.type !== "other")
      .slice(0, 12);

    const hostTriggers = triggers.filter((trigger) =>
      trigger.hosts?.some((h: any) => String(h.hostid) === String(host.hostid) || String(h.name) === String(host.name ?? host.host))
    );

    const alerts = hostTriggers.map((trigger) => ({
      ...mapZabbixTriggerToAlert(trigger),
      siteId: DEMO_SITE_ID,
      siteName: "Lab Black Box",
      description: trigger.comments || trigger.description || "Trigger actif remonte par Zabbix.",
      acknowledged: false,
      resolved: false,
    })) as Alert[];

    const siteStatus: SiteStatus = alerts.some((a) => a.severity === "critical")
      ? "critical"
      : alerts.length > 0
        ? "warning"
        : "ok";

    const site = {
      ...MOCK_SITES.find((s) => s.id === DEMO_SITE_ID)!,
      status: siteStatus,
      alertCount: alerts.length,
      lastUpdate: new Date().toISOString(),
      temperature: sensors.find((s) => s.type === "temperature")?.numericValue ?? 0,
      humidity: sensors.find((s) => s.type === "humidity")?.numericValue ?? 0,
    };

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
      explanation: "Cette vue lit DEMO-LAB comme un site AURION reel : host Zabbix, items SNMP/OID, triggers et alertes actives.",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(mockPayload(error instanceof Error ? error.message : "Erreur Zabbix inconnue"));
  }
}
