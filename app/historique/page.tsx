"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Calendar, 
  Download, 
  Filter,
  AlertTriangle,
  Wrench,
  Info,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HistoryEvent } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export default function HistoriquePage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);

  useEffect(() => {
    // Generate mock history events
    const mockEvents: HistoryEvent[] = [
      {
        id: "1",
        siteId: "site-11",
        siteName: "MarchÃ© d'IntÃ©rÃªt National",
        bayId: "site-11-bay-1",
        type: "alert",
        title: "Alerte tempÃ©rature critique dÃ©clenchÃ©e",
        description: "TempÃ©rature a dÃ©passÃ© 30Â°C dans la Baie 1",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: "critical",
      },
      {
        id: "2",
        siteId: "site-2",
        siteName: "Palais des Sports",
        type: "maintenance",
        title: "Maintenance prÃ©ventive effectuÃ©e",
        description: "Nettoyage des filtres climatisation",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user: "Technicien Martin",
      },
      {
        id: "3",
        siteId: "site-1",
        siteName: "HÃ´tel de Ville",
        bayId: "site-1-bay-3",
        type: "change",
        title: "Configuration modifiÃ©e",
        description: "Seuils de tempÃ©rature ajustÃ©s : warning 25Â°C â†’ 26Â°C",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        user: "Admin DSI",
      },
      {
        id: "4",
        siteId: "site-11",
        siteName: "MarchÃ© d'IntÃ©rÃªt National",
        type: "info",
        title: "Climatisation redÃ©marrÃ©e",
        description: "Retour Ã  la normale aprÃ¨s intervention",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        user: "Technicien Dubois",
      },
      {
        id: "5",
        siteId: "site-7",
        siteName: "Ã‰cole Jules Ferry",
        type: "maintenance",
        title: "Mode maintenance activÃ©",
        description: "Mise Ã  jour firmware capteurs programmÃ©e",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user: "Admin DSI",
      },
      {
        id: "6",
        siteId: "site-2",
        siteName: "Palais des Sports",
        bayId: "site-2-bay-2",
        type: "alert",
        title: "Porte restÃ©e ouverte",
        description: "Capteur de porte dÃ©tectÃ© ouvert pendant 15 minutes",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        severity: "minor",
      },
      {
        id: "7",
        siteId: "site-3",
        siteName: "Centre Technique Municipal",
        type: "change",
        title: "Nouveau capteur ajoutÃ©",
        description: "Installation capteur de pression diffÃ©rentielle",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        user: "Technicien Martin",
      },
      {
        id: "8",
        siteId: "site-11",
        siteName: "MarchÃ© d'IntÃ©rÃªt National",
        type: "alert",
        title: "HumiditÃ© Ã©levÃ©e dÃ©tectÃ©e",
        description: "Taux d'humiditÃ© Ã  68%",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        severity: "major",
      },
    ];

    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterType.length === 0) return true;
    return filterType.includes(event.type);
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "alert": return AlertTriangle;
      case "maintenance": return Wrench;
      case "change": return TrendingUp;
      default: return Info;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (type === "alert") {
      return severity === "critical" ? "border-red-500/50" : 
             severity === "major" ? "border-orange-500/50" : "border-yellow-500/50";
    }
    if (type === "maintenance") return "border-blue-500/50";
    if (type === "change") return "border-purple-500/50";
    return "border-gray-500/50";
  };

  return (
    <div className="min-h-screen">
      <GradientBackground />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-2 gradient-text"
              >
                Historique des Ã‰vÃ©nements
              </motion.h1>
              <p className="text-gray-400">Timeline complÃ¨te de toutes les activitÃ©s</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="glass" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                PÃ©riode
              </Button>
              <Button variant="glass" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Type:</span>
                </div>

                {[
                  { type: "alert", label: "Alertes", icon: AlertTriangle, color: "critical" },
                  { type: "maintenance", label: "Maintenance", icon: Wrench, color: "maintenance" },
                  { type: "change", label: "Modifications", icon: TrendingUp, color: "info" },
                  { type: "info", label: "Informations", icon: Info, color: "ok" },
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Badge
                      key={filter.type}
                      variant={filterType.includes(filter.type) ? (filter.color as any) : "info"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        if (filterType.includes(filter.type)) {
                          setFilterType(filterType.filter(t => t !== filter.type));
                        } else {
                          setFilterType([...filterType, filter.type]);
                        }
                      }}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {filter.label}
                    </Badge>
                  );
                })}

                {filterType.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterType([])}
                    className="text-xs"
                  >
                    RÃ©initialiser
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-nebula-violet via-nebula-magenta to-nebula-cyan opacity-30" />

            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const borderColor = getEventColor(event.type, event.severity);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-20"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-gradient-nebula shadow-neon-md flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    {/* Event Card */}
                    <Card className={`${borderColor} hover:border-nebula-violet/50 transition-all cursor-pointer group`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            event.type === "alert" ? "bg-red-500/10 text-red-500" :
                            event.type === "maintenance" ? "bg-blue-500/10 text-blue-500" :
                            event.type === "change" ? "bg-purple-500/10 text-purple-500" :
                            "bg-gray-500/10 text-gray-500"
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg group-hover:gradient-text transition-all">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                              </div>
                              {event.severity && (
                                <Badge variant={event.severity as any}>
                                  {event.severity}
                                </Badge>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Site:</span>
                                <span className="font-medium text-nebula-cyan">{event.siteName}</span>
                              </div>

                              {event.user && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Par:</span>
                                  <span className="font-medium">{event.user}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 ml-auto">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">{formatRelativeTime(event.timestamp)}</span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">Aucun Ã©vÃ©nement</h3>
                  <p className="text-gray-400">Aucun Ã©vÃ©nement ne correspond aux filtres sÃ©lectionnÃ©s</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
