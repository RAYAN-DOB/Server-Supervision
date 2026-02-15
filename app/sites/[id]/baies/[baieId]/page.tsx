"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Thermometer,
  Droplets,
  Flame,
  DoorOpen,
  Vibrate,
  Zap,
  Wind,
  Gauge,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SensorGauge } from "@/components/ui/sensor-gauge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES, generateBaysForSite } from "@/data/mock-sites";
import { formatRelativeTime } from "@/lib/utils";
import type { Bay } from "@/types";

export default function BayDetailPage() {
  const params = useParams();
  const { sites, setSites } = useStore();
  const [bay, setBay] = useState<Bay | null>(null);
  const [loading, setLoading] = useState(true);

  const site = sites.find(s => s.id === params.id);

  useEffect(() => {
    if (sites.length === 0) {
      setSites(MOCK_SITES);
    }
    
    if (site) {
      const siteBays = generateBaysForSite(site.id, site.name, site.bayCount);
      const foundBay = siteBays.find(b => b.id === params.baieId);
      setBay(foundBay || null);
      setLoading(false);
    }
  }, [site, sites.length, setSites, params.baieId]);

  if (loading || !site || !bay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-nebula-cyan animate-spin" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GradientBackground />
      <Navbar />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/sites" className="hover:text-white transition-colors">Sites</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/sites/${site.id}`} className="hover:text-white transition-colors">{site.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{bay.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-nebula shadow-neon-md">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text"
                  >
                    {bay.name}
                  </motion.h1>
                  <p className="text-sm text-gray-400 mt-1">{bay.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={bay.status as any}>{bay.status}</Badge>
                <span className="text-xs text-gray-500">
                  Dernière mise à jour: {formatRelativeTime(bay.lastUpdate)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="glass" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="glass" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Rapport
              </Button>
            </div>
          </div>

          {/* Sensors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Temperature */}
            <Card glow>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Température</CardTitle>
                  <Thermometer className="w-5 h-5 text-nebula-magenta" />
                </div>
              </CardHeader>
              <CardContent>
                <SensorGauge
                  value={bay.sensors.temperature.value}
                  maxValue={40}
                  unit="°C"
                  label=""
                  status={bay.sensors.temperature.status}
                  size="sm"
                />
                <div className="mt-3 text-xs text-gray-400">
                  <p>Seuil Warning: {bay.sensors.temperature.threshold.warning}°C</p>
                  <p>Seuil Critical: {bay.sensors.temperature.threshold.critical}°C</p>
                </div>
              </CardContent>
            </Card>

            {/* Humidity */}
            <Card glow>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Humidité</CardTitle>
                  <Droplets className="w-5 h-5 text-nebula-cyan" />
                </div>
              </CardHeader>
              <CardContent>
                <SensorGauge
                  value={bay.sensors.humidity.value}
                  maxValue={100}
                  unit="%"
                  label=""
                  status={bay.sensors.humidity.status}
                  size="sm"
                />
                <div className="mt-3 text-xs text-gray-400">
                  <p>Seuil Warning: {bay.sensors.humidity.threshold.warning}%</p>
                  <p>Seuil Critical: {bay.sensors.humidity.threshold.critical}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Airflow */}
            <Card glow>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Flux d'Air</CardTitle>
                  <Wind className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <SensorGauge
                  value={bay.sensors.airflow.value}
                  maxValue={200}
                  unit="m³/h"
                  label=""
                  status={bay.sensors.airflow.status}
                  size="sm"
                />
                <div className="mt-3 text-xs text-gray-400">
                  <p>Flux normal: 120-150 m³/h</p>
                </div>
              </CardContent>
            </Card>

            {/* Pressure */}
            <Card glow>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Pression</CardTitle>
                  <Gauge className="w-5 h-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <SensorGauge
                  value={bay.sensors.pressure.value}
                  maxValue={1050}
                  unit="hPa"
                  label=""
                  status={bay.sensors.pressure.status}
                  size="sm"
                />
                <div className="mt-3 text-xs text-gray-400">
                  <p>Pression standard: ~1013 hPa</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Binary Sensors & Status */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Binary Sensors */}
            <Card>
              <CardHeader>
                <CardTitle>Capteurs Binaires</CardTitle>
                <CardDescription>États on/off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Flame, label: "Détecteur Fumée", sensor: bay.sensors.smoke, critical: true },
                  { icon: Droplets, label: "Détecteur Eau", sensor: bay.sensors.water, critical: true },
                  { icon: DoorOpen, label: "Capteur Porte", sensor: bay.sensors.door, critical: false },
                  { icon: Zap, label: "Alimentation 230V", sensor: bay.sensors.power230v, critical: false },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.sensor.active && item.critical
                          ? "bg-red-500/10 border border-red-500/30"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${
                          item.sensor.active && item.critical ? "text-red-500" : 
                          item.sensor.active ? "text-green-500" : "text-gray-500"
                        }`} />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-gray-400">
                            Mis à jour {formatRelativeTime(item.sensor.lastUpdate)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.sensor.active && item.critical ? "critical" :
                          item.sensor.active ? "ok" : "info"
                        }
                      >
                        {item.sensor.active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Network & Power */}
            <Card>
              <CardHeader>
                <CardTitle>Réseau & Consommation</CardTitle>
                <CardDescription>Informations techniques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Consommation Électrique</span>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold gradient-text">{bay.powerConsumption.toFixed(2)} kW</p>
                  <p className="text-xs text-gray-500 mt-1">Coût estimé: {(bay.powerConsumption * 0.15 * 24).toFixed(2)}€/jour</p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Trafic Réseau</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Entrant</p>
                      <p className="text-lg font-semibold text-green-400">
                        {bay.networkUsage.inbound.toFixed(1)} Mbps
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sortant</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {bay.networkUsage.outbound.toFixed(1)} Mbps
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Vibrations</span>
                    <Vibrate className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-lg font-semibold">{bay.sensors.vibration.value.toFixed(3)} g</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Seuil: {bay.sensors.vibration.threshold.critical} g
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts for this Bay */}
          {bay.status !== "ok" && (
            <Card className="border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <CardTitle>Alertes Actives</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="font-medium text-yellow-400">Attention requise</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Cette baie nécessite une vérification. Consultez la page alertes pour plus de détails.
                  </p>
                  <Link href="/alertes">
                    <Button variant="glass" size="sm" className="mt-3">
                      Voir les alertes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
