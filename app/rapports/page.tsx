"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Building2,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Printer,
  BookOpen,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useSitesReference } from "@/hooks/useSitesReference";
import { useStore } from "@/store/useStore";
import { MOCK_ALERTS, MOCK_SITES } from "@/data/mock-sites";

// ─── Utilitaires d'export CSV ─────────────────────────────────────────────────

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRow(values: unknown[]): string {
  return values.map(escapeCsv).join(",");
}

function downloadCsv(filename: string, rows: string[]): void {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const content = BOM + rows.join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function printReport(title: string, html: string): void {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Autorisez les pop-ups pour imprimer");
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 32px; }
        h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .subtitle { font-size: 12px; color: #666; margin-bottom: 24px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 4px; }
        .badge-ok { background: #d1fae5; color: #065f46; }
        .badge-warn { background: #fef3c7; color: #92400e; }
        .badge-crit { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        th { background: #f3f4f6; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
        td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; }
        tr:nth-child(even) td { background: #fafafa; }
        .section-title { font-size: 16px; font-weight: 700; margin: 28px 0 10px; color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .kpi-card { background: #f9fafb; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid #e5e7eb; }
        .kpi-value { font-size: 28px; font-weight: 800; color: #4f46e5; }
        .kpi-label { font-size: 11px; color: #666; margin-top: 4px; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; display: flex; justify-content: space-between; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>${html}<script>window.onload=()=>window.print();<\/script></body>
    </html>
  `);
  win.document.close();
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function RapportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "annual"
  >("weekly");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { sites: sitesReference, stats: refStats } = useSitesReference();
  const { alerts: storeAlerts, sites: storeSites } = useStore();

  const alerts = storeAlerts.length > 0 ? storeAlerts : MOCK_ALERTS;
  const supervisionSites = storeSites.length > 0 ? storeSites : MOCK_SITES;

  const periodLabel: Record<string, string> = {
    daily: "Quotidien (24h)",
    weekly: "Hebdomadaire (7j)",
    monthly: "Mensuel (30j)",
    annual: "Annuel (12 mois)",
  };

  // ── Générateurs de rapports réels ─────────────────────────────────────────

  const generateExecutiveReport = () => {
    const now = new Date();
    const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);
    const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
    const avgUptime = (
      supervisionSites.reduce((s, x) => s + x.uptime, 0) /
      (supervisionSites.length || 1)
    ).toFixed(1);
    const avgTemp = (
      supervisionSites.reduce((s, x) => s + x.temperature, 0) /
      (supervisionSites.length || 1)
    ).toFixed(1);

    const html = `
      <h1>Rapport Exécutif — AURION</h1>
      <p class="subtitle">DSI Maisons-Alfort · Généré le ${formatDate(now)} · Période : ${periodLabel[selectedPeriod]}</p>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-value">${refStats.total}</div><div class="kpi-label">Sites municipaux</div></div>
        <div class="kpi-card"><div class="kpi-value">${activeAlerts.length}</div><div class="kpi-label">Alertes actives</div></div>
        <div class="kpi-card"><div class="kpi-value">${avgUptime}%</div><div class="kpi-label">Disponibilité moyenne</div></div>
        <div class="kpi-card"><div class="kpi-value">${avgTemp}°C</div><div class="kpi-label">Température moyenne</div></div>
      </div>
      <div class="section-title">Alertes critiques (${criticalAlerts.length})</div>
      ${criticalAlerts.length === 0
        ? '<p style="color:#16a34a;font-size:13px;">✅ Aucune alerte critique en cours.</p>'
        : `<table><thead><tr><th>Site</th><th>Titre</th><th>Sévérité</th><th>Date</th></tr></thead><tbody>
          ${criticalAlerts.map((a) => `<tr><td>${a.siteName}</td><td>${a.title}</td><td><span class="badge badge-crit">${a.severity}</span></td><td>${formatDate(a.timestamp)}</td></tr>`).join("")}
        </tbody></table>`}
      <div class="section-title">Recommandations</div>
      <ul style="font-size:13px;padding-left:20px;line-height:1.9">
        ${criticalAlerts.length > 0 ? "<li>Traiter en priorité les alertes critiques identifiées ci-dessus.</li>" : ""}
        ${parseFloat(avgTemp) > 24 ? "<li>La température moyenne dépasse 24°C — vérifier la climatisation des sites.</li>" : ""}
        <li>Planifier les maintenances préventives pour la période à venir.</li>
        <li>Vérifier l'état des ${refStats.notConnectedZabbix ?? refStats.total - refStats.connectedZabbix} sites non connectés à Zabbix.</li>
      </ul>
      <div class="footer"><span>AURION · DSI Maisons-Alfort</span><span>Rapport confidentiel — usage interne</span></div>
    `;
    printReport("Rapport Exécutif — AURION", html);
  };

  const generateReferentielCsv = () => {
    const headers = buildCsvRow([
      "ID", "Nom", "Adresse", "Code postal", "Ville",
      "Catégorie", "Géré par DSI", "Statut adresse",
      "Zabbix", "Capteurs", "LT count", "Lat", "Lng",
      "BlackBox installée", "Créé le", "Mis à jour le",
    ]);
    const rows = sitesReference.map((s) =>
      buildCsvRow([
        s.id, s.name, s.address ?? "", s.postalCode, s.city,
        s.category ?? "", s.likelyManagedByDSI ? "Oui" : "Non",
        s.addressStatus, s.zabbixStatus, s.sensorsStatus,
        s.ltCount ?? 0, s.lat ?? "", s.lng ?? "",
        s.blackboxInstalled ? "Oui" : "Non",
        formatDate(s.createdAt), formatDate(s.updatedAt),
      ])
    );
    downloadCsv(
      `aurion_referentiel_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
    toast.success(`Référentiel exporté — ${sitesReference.length} sites`);
  };

  const generateAlertsCsv = () => {
    const headers = buildCsvRow([
      "ID", "Site", "Titre", "Sévérité", "Description",
      "Timestamp", "Acquittée", "Acquittée par", "Résolue",
    ]);
    const rows = alerts.map((a) =>
      buildCsvRow([
        a.id, a.siteName, a.title, a.severity, a.description,
        formatDate(a.timestamp),
        a.acknowledged ? "Oui" : "Non",
        a.acknowledgedBy ?? "",
        a.resolved ? "Oui" : "Non",
      ])
    );
    downloadCsv(
      `aurion_alertes_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
    toast.success(`Alertes exportées — ${alerts.length} entrées`);
  };

  const generateTechnicalReport = () => {
    const now = new Date();
    const html = `
      <h1>Rapport Technique — AURION</h1>
      <p class="subtitle">DSI Maisons-Alfort · Généré le ${formatDate(now)} · Période : ${periodLabel[selectedPeriod]}</p>
      <div class="section-title">Supervision des sites</div>
      <table><thead><tr><th>Site</th><th>Statut</th><th>Temp. (°C)</th><th>Humidité (%)</th><th>Uptime (%)</th><th>Consommation (W)</th><th>Alertes</th></tr></thead>
      <tbody>
        ${supervisionSites.map((s) => `<tr>
          <td>${s.name}</td>
          <td><span class="badge ${s.status === "ok" ? "badge-ok" : s.status === "warning" ? "badge-warn" : "badge-crit"}">${s.status}</span></td>
          <td>${s.temperature.toFixed(1)}</td>
          <td>${s.humidity.toFixed(0)}</td>
          <td>${s.uptime.toFixed(1)}</td>
          <td>${s.powerConsumption.toFixed(0)}</td>
          <td>${s.alertCount}</td>
        </tr>`).join("")}
      </tbody></table>
      <div class="section-title">Événements récents</div>
      <table><thead><tr><th>Site</th><th>Titre</th><th>Sévérité</th><th>Date</th><th>État</th></tr></thead>
      <tbody>
        ${alerts.slice(0, 30).map((a) => `<tr>
          <td>${a.siteName}</td><td>${a.title}</td>
          <td><span class="badge ${a.severity === "critical" ? "badge-crit" : a.severity === "major" ? "badge-warn" : "badge-info"}">${a.severity}</span></td>
          <td>${formatDate(a.timestamp)}</td>
          <td>${a.resolved ? "Résolu" : a.acknowledged ? "Acquitté" : "Actif"}</td>
        </tr>`).join("")}
      </tbody></table>
      <div class="footer"><span>AURION · DSI Maisons-Alfort</span><span>Document technique — confidentiel</span></div>
    `;
    printReport("Rapport Technique — AURION", html);
  };

  const generateIncidentsCsv = () => {
    const headers = buildCsvRow([
      "ID", "Site", "Baie", "Sévérité", "Titre", "Description",
      "Date", "Durée (min)", "Acquittée", "Acquittée par", "Date acquittement",
      "Résolue", "Date résolution",
    ]);
    const rows = alerts.map((a) => {
      const start = new Date(a.timestamp).getTime();
      const end = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
      const durationMin = Math.round((end - start) / 60000);
      return buildCsvRow([
        a.id, a.siteName, a.bayName ?? "", a.severity, a.title, a.description,
        formatDate(a.timestamp), durationMin,
        a.acknowledged ? "Oui" : "Non",
        a.acknowledgedBy ?? "",
        a.acknowledgedAt ? formatDate(a.acknowledgedAt) : "",
        a.resolved ? "Oui" : "Non",
        a.resolvedAt ? formatDate(a.resolvedAt) : "",
      ]);
    });
    downloadCsv(
      `aurion_incidents_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
    toast.success(`Rapport incidents exporté — ${alerts.length} incidents`);
  };

  const generatePerformanceCsv = () => {
    const headers = buildCsvRow([
      "Site", "Statut", "Uptime (%)", "Température (°C)", "Humidité (%)",
      "Consommation (W)", "Baies", "Alertes actives",
    ]);
    const rows = supervisionSites.map((s) =>
      buildCsvRow([
        s.name, s.status, s.uptime.toFixed(2),
        s.temperature.toFixed(1), s.humidity.toFixed(0),
        s.powerConsumption.toFixed(0), s.bayCount, s.alertCount,
      ])
    );
    downloadCsv(
      `aurion_performance_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
    toast.success(`Rapport performance exporté — ${supervisionSites.length} sites`);
  };

  // ── Dispatch par type de rapport et format ────────────────────────────────

  const handleGenerate = async (
    reportId: string,
    format: "pdf" | "csv" | "print"
  ) => {
    const key = `${reportId}-${format}`;
    setGeneratingId(key);

    try {
      await new Promise((r) => setTimeout(r, 300)); // micro-delay UX

      switch (reportId) {
        case "executive":
          generateExecutiveReport();
          toast.success("Rapport exécutif prêt à imprimer");
          break;
        case "technical":
          if (format === "print") {
            generateTechnicalReport();
            toast.success("Rapport technique prêt à imprimer");
          } else {
            generateReferentielCsv();
          }
          break;
        case "referentiel":
          generateReferentielCsv();
          break;
        case "incidents":
          generateIncidentsCsv();
          break;
        case "performance":
          generatePerformanceCsv();
          break;
        default:
          toast.info("Rapport en cours de développement");
      }
    } finally {
      setGeneratingId(null);
    }
  };

  // ─── Config des types de rapports ──────────────────────────────────────────

  const reportTypes = [
    {
      id: "executive",
      title: "Rapport Exécutif",
      description: "Vue d'ensemble pour la direction",
      icon: FileText,
      color: "purple",
      includes: ["KPIs globaux", "Tendances", "Alertes critiques", "Recommandations"],
      actions: [{ label: "Imprimer / PDF", format: "print" as const, icon: Printer }],
    },
    {
      id: "technical",
      title: "Rapport Technique",
      description: "Détails complets pour la DSI",
      icon: Building2,
      color: "cyan",
      includes: ["Tous les sites", "Historique capteurs", "Événements", "Maintenance"],
      actions: [
        { label: "Imprimer", format: "print" as const, icon: Printer },
        { label: "CSV", format: "csv" as const, icon: FileSpreadsheet },
      ],
    },
    {
      id: "referentiel",
      title: "Rapport Référentiel",
      description: "Inventaire des sites municipaux",
      icon: BookOpen,
      color: "violet",
      includes: [
        `${refStats.total} sites municipaux`,
        "Statuts adresse",
        "Intégration Zabbix",
        "Locaux techniques",
      ],
      actions: [{ label: "Exporter CSV", format: "csv" as const, icon: FileSpreadsheet }],
    },
    {
      id: "incidents",
      title: "Rapport d'Incidents",
      description: "Analyse des alertes et problèmes",
      icon: AlertTriangle,
      color: "red",
      includes: [
        "Alertes par sévérité",
        "Temps de résolution",
        "Sites critiques",
        "Actions",
      ],
      actions: [{ label: "Exporter CSV", format: "csv" as const, icon: FileSpreadsheet }],
    },
    {
      id: "performance",
      title: "Rapport de Performance",
      description: "Métriques et optimisations",
      icon: TrendingUp,
      color: "green",
      includes: ["Uptime", "Consommation", "Températures", "Statuts"],
      actions: [{ label: "Exporter CSV", format: "csv" as const, icon: FileSpreadsheet }],
    },
  ];

  const periods = [
    { id: "daily", label: "Quotidien", description: "Dernières 24h" },
    { id: "weekly", label: "Hebdomadaire", description: "7 derniers jours" },
    { id: "monthly", label: "Mensuel", description: "30 derniers jours" },
    { id: "annual", label: "Annuel", description: "12 derniers mois" },
  ];

  const gradients: Record<string, string> = {
    purple: "from-purple-600 to-purple-800",
    cyan: "from-cyan-600 to-blue-700",
    violet: "from-violet-600 to-purple-700",
    red: "from-red-500 to-pink-600",
    green: "from-green-500 to-emerald-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          Rapports et Exports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Générez et exportez des rapports réels depuis les données de supervision
        </p>
      </motion.div>

      {/* Sélecteur de période */}
      <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Période du rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() =>
                  setSelectedPeriod(period.id as typeof selectedPeriod)
                }
                className={cn(
                  "p-4 rounded-xl border transition-all text-left",
                  selectedPeriod === period.id
                    ? "bg-purple-600/20 border-purple-500/40 ring-1 ring-purple-500/20"
                    : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
                )}
              >
                <p className="font-semibold text-sm text-white mb-1">
                  {period.label}
                </p>
                <p className="text-xs text-gray-500">{period.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Types de rapports */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <Card className="bg-white/[0.02] border-white/[0.06] hover:border-purple-500/20 transition-all h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        gradients[report.color]
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="info" className="text-[10px]">
                      {selectedPeriod}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    {report.includes.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {report.actions.map(({ label, format, icon: ActionIcon }) => {
                      const key = `${report.id}-${format}`;
                      const isLoading = generatingId === key;
                      return (
                        <Button
                          key={format}
                          onClick={() => handleGenerate(report.id, format)}
                          disabled={generatingId !== null}
                          size="sm"
                          variant={format === "csv" ? "glass" : "default"}
                          className="flex-1 text-xs min-w-[80px]"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <ActionIcon className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
          <p className="text-xs text-gray-500">Exports directs sans configuration</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="glass"
            className="justify-start"
            onClick={generateReferentielCsv}
            disabled={generatingId !== null}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-400" />
            Exporter référentiel (CSV)
          </Button>
          <Button
            variant="glass"
            className="justify-start"
            onClick={generateAlertsCsv}
            disabled={generatingId !== null}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-orange-400" />
            Exporter toutes les alertes (CSV)
          </Button>
          <Button
            variant="glass"
            className="justify-start"
            onClick={() => {
              downloadJson(
                `aurion_referentiel_${new Date().toISOString().slice(0, 10)}.json`,
                sitesReference
              );
              toast.success("Export JSON téléchargé");
            }}
            disabled={generatingId !== null}
          >
            <Download className="w-4 h-4 mr-2 text-cyan-400" />
            Export JSON référentiel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
