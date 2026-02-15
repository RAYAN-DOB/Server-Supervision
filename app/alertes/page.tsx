"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Bell,
  X,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { MOCK_ALERTS } from "@/data/mock-sites";
import { formatRelativeTime, getSeverityColor } from "@/lib/utils";

export default function AlertesPage() {
  const { alerts, setAlerts, acknowledgeAlert, currentUser } = useStore();
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  useEffect(() => {
    if (alerts.length === 0) {
      setAlerts(MOCK_ALERTS);
    }
  }, [alerts.length, setAlerts]);

  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (filterSeverity.length > 0 && !filterSeverity.includes(alert.severity)) return false;
    return true;
  });

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const majorCount = activeAlerts.filter(a => a.severity === "major").length;
  const minorCount = activeAlerts.filter(a => a.severity === "minor").length;

  const handleAcknowledge = (alertId: string) => {
    if (currentUser) {
      acknowledgeAlert(alertId, currentUser.name);
    }
  };

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
              Centre d'Alertes
            </motion.h1>
            <p className="text-gray-400">Surveillez et gérez toutes les alertes système</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={criticalCount > 0 ? "border-red-500/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Critiques</p>
                    <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Majeures</p>
                    <p className="text-2xl font-bold text-orange-400">{majorCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Mineures</p>
                    <p className="text-2xl font-bold text-yellow-400">{minorCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Acquittées</p>
                    <p className="text-2xl font-bold text-green-400">
                      {alerts.filter(a => a.acknowledged).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filtres:</span>
                </div>

                {["critical", "major", "minor", "info"].map(severity => (
                  <Badge
                    key={severity}
                    variant={filterSeverity.includes(severity) ? (severity as any) : "info"}
                    className="cursor-pointer hover:scale-105 transition-transform capitalize"
                    onClick={() => {
                      if (filterSeverity.includes(severity)) {
                        setFilterSeverity(filterSeverity.filter(s => s !== severity));
                      } else {
                        setFilterSeverity([...filterSeverity, severity]);
                      }
                    }}
                  >
                    {severity}
                  </Badge>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant={showAcknowledged ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowAcknowledged(!showAcknowledged)}
                  >
                    {showAcknowledged ? "Masquer" : "Afficher"} acquittées
                  </Button>

                  <Button variant="glass" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`cursor-pointer hover:border-nebula-violet/50 transition-all ${
                    alert.severity === "critical" ? "border-red-500/30" : ""
                  } ${alert.acknowledged ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Severity Badge */}
                      <div
                        className="w-1 h-full rounded-full"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      />

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={alert.severity as any}>
                                {alert.severity}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="ok">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Acquittée
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-sm text-gray-400">{alert.description}</p>
                          </div>

                          {!alert.acknowledged && (
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Acquitter
                            </Button>
                          )}
                        </div>

                        {/* Alert Details */}
                        <div className="flex flex-wrap gap-4 text-sm mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Site:</span>
                            <span className="font-medium text-nebula-cyan">{alert.siteName}</span>
                          </div>

                          {alert.bayName && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Baie:</span>
                              <span className="font-medium">{alert.bayName}</span>
                            </div>
                          )}

                          {alert.sensorType && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Capteur:</span>
                              <span className="font-medium capitalize">{alert.sensorType}</span>
                            </div>
                          )}

                          {alert.value !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Valeur:</span>
                              <span className="font-medium text-red-400">
                                {alert.value} {alert.threshold && `(seuil: ${alert.threshold})`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">{formatRelativeTime(alert.timestamp)}</span>
                          </div>
                        </div>

                        {/* Acknowledged Info */}
                        {alert.acknowledged && alert.acknowledgedBy && (
                          <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                            <p className="text-gray-500">
                              Acquittée par <span className="text-green-400">{alert.acknowledgedBy}</span>
                              {" le "}{formatRelativeTime(alert.acknowledgedAt || "")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Aucune alerte</h3>
                  <p className="text-gray-400">
                    {showAcknowledged
                      ? "Aucune alerte ne correspond aux filtres sélectionnés"
                      : "Toutes les alertes ont été acquittées"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
