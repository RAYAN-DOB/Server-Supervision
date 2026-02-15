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
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      color: "violet",
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

  return (
    <div className="min-h-screen">
      <GradientBackground />
      <Navbar />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2 gradient-text"
            >
              Rapports & Exports
            </motion.h1>
            <p className="text-gray-400">Générez des rapports professionnels pour votre équipe</p>
          </div>

          {/* Period Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-nebula-cyan" />
                Période du Rapport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {periods.map((period) => (
                  <motion.button
                    key={period.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPeriod(period.id as any)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedPeriod === period.id
                        ? "bg-gradient-nebula border-nebula-violet shadow-neon-md"
                        : "bg-white/5 border-white/10 hover:border-nebula-violet/50"
                    }`}
                  >
                    <p className="font-semibold mb-1">{period.label}</p>
                    <p className="text-xs text-gray-400">{period.description}</p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Types */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-nebula-violet/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                          report.color === 'violet' ? 'from-nebula-violet to-purple-600' :
                          report.color === 'cyan' ? 'from-nebula-cyan to-blue-500' :
                          report.color === 'red' ? 'from-red-500 to-pink-500' :
                          'from-green-500 to-emerald-600'
                        } flex items-center justify-center shadow-neon-sm`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <Badge variant="info" className="text-xs">{selectedPeriod}</Badge>
                      </div>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Includes */}
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Inclus dans ce rapport:</p>
                        <div className="space-y-1">
                          {report.includes.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleGenerateReport(report.id, "pdf")}
                          disabled={generating}
                          className="flex-1"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          onClick={() => handleGenerateReport(report.id, "excel")}
                          disabled={generating}
                          variant="glass"
                          className="flex-1"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Excel
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={generating}
                          title="Imprimer"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>Exports et rapports prédéfinis</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              <Button
                variant="glass"
                className="justify-start"
                onClick={() => toast.success("Export CSV démarré")}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter tous les sites (CSV)
              </Button>
              <Button
                variant="glass"
                className="justify-start"
                onClick={() => toast.success("Export alertes démarré")}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter toutes les alertes
              </Button>
              <Button
                variant="glass"
                className="justify-start"
                onClick={() => toast.success("Rapport automatique configuré")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Programmer rapport hebdo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
