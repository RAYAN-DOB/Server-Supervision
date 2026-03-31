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
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RapportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "annual">("weekly");
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    {
      id: "executive",
      title: "Rapport Exécutif",
      description: "Vue d'ensemble pour la direction",
      icon: FileText,
      color: "purple",
      includes: ["KPIs globaux", "Tendances", "Alertes critiques", "Recommandations"],
    },
    {
      id: "technical",
      title: "Rapport Technique",
      description: "Détails complets pour la DSI",
      icon: Building2,
      color: "cyan",
      includes: ["Tous les sites", "Historique capteurs", "Événements", "Maintenance"],
    },
    {
      id: "referentiel",
      title: "Rapport Référentiel",
      description: "Inventaire des sites municipaux",
      icon: BookOpen,
      color: "violet",
      includes: ["36 sites municipaux", "Statuts adresse", "Intégration Zabbix", "Locaux techniques"],
    },
    {
      id: "incidents",
      title: "Rapport d'Incidents",
      description: "Analyse des alertes et problèmes",
      icon: AlertTriangle,
      color: "red",
      includes: ["Alertes par sévérité", "Temps de résolution", "Sites critiques", "Actions"],
    },
    {
      id: "performance",
      title: "Rapport de Performance",
      description: "Métriques et optimisations",
      icon: TrendingUp,
      color: "green",
      includes: ["Uptime", "Consommation", "Tendances", "Prédictions"],
    },
  ];

  const handleGenerateReport = (reportId: string, format: "pdf" | "excel") => {
    setGenerating(true);
    toast.loading(`Génération du rapport ${format.toUpperCase()}...`);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`Rapport ${format.toUpperCase()} généré avec succès !`, {
        description: "Le téléchargement va commencer...",
      });
    }, 2000);
  };

  const periods = [
    { id: "daily", label: "Quotidien", description: "Dernières 24h" },
    { id: "weekly", label: "Hebdomadaire", description: "7 derniers jours" },
    { id: "monthly", label: "Mensuel", description: "30 derniers jours" },
    { id: "annual", label: "Annuel", description: "12 derniers mois" },
  ];

  const gradients: Record<string, string> = {
    purple: "from-purple-600 to-purple-800",
    cyan:   "from-cyan-600 to-blue-700",
    violet: "from-violet-600 to-purple-700",
    red:    "from-red-500 to-pink-600",
    green:  "from-green-500 to-emerald-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          Rapports et Exports
        </h1>
        <p className="text-sm text-gray-500 mt-1">Générez des rapports professionnels pour votre équipe</p>
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
                onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left",
                  selectedPeriod === period.id
                    ? "bg-purple-600/20 border-purple-500/40 ring-1 ring-purple-500/20"
                    : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
                )}
              >
                <p className="font-semibold text-sm text-white mb-1">{period.label}</p>
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
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", gradients[report.color])}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="info" className="text-[10px]">{selectedPeriod}</Badge>
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    {report.includes.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleGenerateReport(report.id, "pdf")}
                      disabled={generating}
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleGenerateReport(report.id, "excel")}
                      disabled={generating}
                      variant="glass"
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Excel
                    </Button>
                    <Button variant="ghost" size="icon" disabled={generating} title="Imprimer">
                      <Printer className="w-4 h-4" />
                    </Button>
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
          <p className="text-xs text-gray-500">Exports et rapports prédéfinis</p>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="glass" className="justify-start" onClick={() => toast.success("Export CSV démarré")}>
            <Download className="w-4 h-4 mr-2" />
            Exporter tous les sites (CSV)
          </Button>
          <Button variant="glass" className="justify-start" onClick={() => toast.success("Export alertes démarré")}>
            <Download className="w-4 h-4 mr-2" />
            Exporter toutes les alertes
          </Button>
          <Button variant="glass" className="justify-start" onClick={() => toast.success("Rapport automatique configuré")}>
            <Calendar className="w-4 h-4 mr-2" />
            Programmer rapport hebdo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
