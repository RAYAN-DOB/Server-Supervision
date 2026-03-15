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
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HistoryEvent } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

const EVENT_TYPES = {
  alert: { label: "Alertes", icon: AlertTriangle, color: "red" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "blue" },
  change: { label: "Modifications", icon: TrendingUp, color: "purple" },
  info: { label: "Informations", icon: Info, color: "gray" },
} as const;

export default function HistoriquePage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);

  useEffect(() => {
    const mockEvents: HistoryEvent[] = [
      {
        id: "1",
        siteId: "site-11",
        siteName: "Marché d'Intérêt National",
        bayId: "site-11-bay-1",
        type: "alert",
        title: "Alerte température critique déclenchée",
        description: "Température a dépassé 30°C dans la Baie 1",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: "critical",
      },
      {
        id: "2",
        siteId: "site-2",
        siteName: "Palais des Sports",
        type: "maintenance",
        title: "Maintenance préventive effectuée",
        description: "Nettoyage des filtres climatisation",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user: "Technicien Martin",
      },
      {
        id: "3",
        siteId: "site-1",
        siteName: "Hôtel de Ville",
        bayId: "site-1-bay-3",
        type: "change",
        title: "Configuration modifiée",
        description: "Seuils de température ajustés : warning 25°C → 26°C",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        user: "Admin DSI",
      },
      {
        id: "4",
        siteId: "site-11",
        siteName: "Marché d'Intérêt National",
        type: "info",
        title: "Climatisation redémarrée",
        description: "Retour à la normale après intervention",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        user: "Technicien Dubois",
      },
      {
        id: "5",
        siteId: "site-7",
        siteName: "École Jules Ferry",
        type: "maintenance",
        title: "Mode maintenance activé",
        description: "Mise à jour firmware capteurs programmée",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user: "Admin DSI",
      },
      {
        id: "6",
        siteId: "site-2",
        siteName: "Palais des Sports",
        bayId: "site-2-bay-2",
        type: "alert",
        title: "Porte restée ouverte",
        description: "Capteur de porte détecté ouvert pendant 15 minutes",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        severity: "minor",
      },
      {
        id: "7",
        siteId: "site-3",
        siteName: "Centre Technique Municipal",
        type: "change",
        title: "Nouveau capteur ajouté",
        description: "Installation capteur de pression différentielle",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        user: "Technicien Martin",
      },
      {
        id: "8",
        siteId: "site-11",
        siteName: "Marché d'Intérêt National",
        type: "alert",
        title: "Humidité élevée détectée",
        description: "Taux d'humidité à 68%",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        severity: "major",
      },
      {
        id: "9",
        siteId: "HTDV",
        siteName: "Hôtel de Ville",
        type: "change",
        title: "Référentiel mis à jour",
        description: "Ajout de 36 sites municipaux dans le référentiel",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        user: "Système",
      },
      {
        id: "10",
        siteId: "PLDS",
        siteName: "Palais des Sports",
        type: "info",
        title: "Connexion Zabbix établie",
        description: "Host PLDS-IOT-01 lié au site Palais des Sports",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
        user: "Admin DSI",
      },
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filterType.length === 0) return true;
    return filterType.includes(event.type);
  });

  const toggleFilter = (type: string) => {
    setFilterType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Historique des événements
          </h1>
          <p className="text-sm text-gray-500 mt-1">Timeline complète de toutes les activités</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Période
          </Button>
          <Button variant="glass" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Filtres */}
      <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-500">Filtrer :</span>
            {(Object.entries(EVENT_TYPES) as [string, { label: string; icon: typeof AlertTriangle; color: string }][]).map(([type, cfg]) => {
              const Icon = cfg.icon;
              const active = filterType.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    active
                      ? cn(
                          cfg.color === "red" && "bg-red-500/15 text-red-400 border-red-500/20",
                          cfg.color === "blue" && "bg-blue-500/15 text-blue-400 border-blue-500/20",
                          cfg.color === "purple" && "bg-purple-500/15 text-purple-400 border-purple-500/20",
                          cfg.color === "gray" && "bg-gray-500/15 text-gray-400 border-gray-500/20",
                        )
                      : "bg-white/[0.03] text-gray-500 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </button>
              );
            })}
            {filterType.length > 0 && (
              <button onClick={() => setFilterType([])} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-white transition-colors">
                <X className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/40 via-cyan-500/20 to-transparent" />

        <div className="space-y-4">
          {filteredEvents.map((event, index) => {
            const cfg = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES] ?? EVENT_TYPES.info;
            const Icon = cfg.icon;
            const colorMap: Record<string, string> = {
              red: "bg-red-500/10 text-red-400 border-red-500/20",
              blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
            };
            const dotColorMap: Record<string, string> = {
              red: "bg-red-500",
              blue: "bg-blue-500",
              purple: "bg-purple-500",
              gray: "bg-gray-500",
            };

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative pl-16"
              >
                {/* Dot */}
                <div className={cn(
                  "absolute left-5.5 top-5 w-3.5 h-3.5 rounded-full border-2 border-[#020208] z-10",
                  dotColorMap[cfg.color] ?? "bg-gray-500"
                )} style={{ left: "22px" }} />

                {/* Card */}
                <div className={cn(
                  "rounded-xl border p-4 hover:border-purple-500/20 transition-all cursor-pointer group",
                  "bg-white/[0.02] border-white/[0.06]"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colorMap[cfg.color])}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{event.title}</h3>
                        {event.severity && (
                          <Badge variant={event.severity as "critical" | "info"} className="text-[10px] flex-shrink-0">
                            {event.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-purple-400 font-medium">{event.siteName}</span>
                        {event.user && (
                          <span className="text-gray-500">par <span className="text-gray-300">{event.user}</span></span>
                        )}
                        <span className="flex items-center gap-1 text-gray-600 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="clean-card p-16 text-center ml-16">
            <History className="w-14 h-14 mx-auto mb-3 text-gray-600" />
            <h3 className="text-lg font-semibold text-white mb-1">Aucun événement</h3>
            <p className="text-sm text-gray-600 font-light">
              Aucun événement ne correspond aux filtres sélectionnés
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
