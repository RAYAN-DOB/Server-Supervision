"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Thermometer,
  Droplets,
  Activity,
  Zap,
  ChevronRight,
  RefreshCw,
  Download,
  Network,
  HardDrive,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SensorGauge } from "@/components/ui/sensor-gauge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { MOCK_SITES, generateBaysForSite } from "@/data/mock-sites";
import { formatTemperature, formatHumidity, formatRelativeTime } from "@/lib/utils";
import type { Bay } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SiteDetailPage() {
  const params = useParams();
  const { sites, setSites } = useStore();
  const [bays, setBays] = useState<Bay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempHistory, setTempHistory] = useState<any[]>([]);

  const site = sites.find(s => s.id === params.id);

  useEffect(() => {
    if (sites.length === 0) {
      setSites(MOCK_SITES);
    }
    
    if (site) {
      const siteBays = generateBaysForSite(site.id, site.name, site.bayCount);
      setBays(siteBays);
      
      // Generate temperature history
      const history = Array.from({ length: 12 }, (_, i) => ({
        time: `${11-i}h`,
        temperature: site.temperature + Math.sin(i / 3) * 1.5,
      })).reverse();
      setTempHistory(history);
      
      setLoading(false);
    }
  }, [site, sites.length, setSites]);

  if (loading || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker">
        <GradientBackground />
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-nebula-cyan animate-spin" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const avgTemp = bays.reduce((sum, bay) => sum + bay.sensors.temperature.value, 0) / (bays.length || 1);
  const avgHumidity = bays.reduce((sum, bay) => sum + bay.sensors.humidity.value, 0) / (bays.length || 1);
  const totalPower = bays.reduce((sum, bay) => sum + bay.powerConsumption, 0);
  const avgNetwork = bays.reduce((sum, bay) => sum + bay.networkUsage.inbound, 0) / (bays.length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker">
      <GradientBackground />
      <Navbar />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/sites" className="hover:text-nebula-cyan transition-colors">Sites</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{site.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-nebula-violet to-nebula-magenta shadow-neon-lg"
                >
                  <Building2 className="w-8 h-8" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  >
                    {site.name}
                  </motion.h1>
                  <div className="flex items-center gap-2 text-gray-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{site.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={site.status as any}>{site.status}</Badge>
                <Badge variant="info" className="capitalize">{site.type}</Badge>
                <span className="text-xs text-gray-600">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Mis à jour {formatRelativeTime(site.lastUpdate)}
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-white/5 bg-white/[0.02] hover:border-nebula-cyan/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Baies</p>
                    <p className="text-2xl font-bold text-nebula-cyan">{site.bayCount}</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-nebula-cyan opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-white/[0.02] hover:border-nebula-magenta/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Température</p>
                    <p className="text-2xl font-bold text-nebula-magenta">{formatTemperature(avgTemp)}</p>
                  </div>
                  <Thermometer className="w-8 h-8 text-nebula-magenta opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-white/[0.02] hover:border-nebula-cyan/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Humidité</p>
                    <p className="text-2xl font-bold text-nebula-cyan">{formatHumidity(avgHumidity)}</p>
                  </div>
                  <Droplets className="w-8 h-8 text-nebula-cyan opacity-30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-white/[0.02] hover:border-yellow-500/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Consommation</p>
                    <p className="text-2xl font-bold text-yellow-400">{totalPower.toFixed(1)} kW</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500 opacity-30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bays" className="mb-8">
            <TabsList>
              <TabsTrigger value="bays">
                <HardDrive className="w-4 h-4 mr-2" />
                Baies ({bays.length})
              </TabsTrigger>
              <TabsTrigger value="sensors">
                <Thermometer className="w-4 h-4 mr-2" />
                Capteurs
              </TabsTrigger>
              <TabsTrigger value="network">
                <Network className="w-4 h-4 mr-2" />
                Réseau
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="w-4 h-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>

            {/* Bays Tab */}
            <TabsContent value="bays">
              <div className="grid md:grid-cols-2 gap-4">
                {bays.map((bay, index) => (
                  <Link key={bay.id} href={`/sites/${site.id}/baies/${bay.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      <Card className="border-white/5 bg-white/[0.02] hover:border-nebula-violet/30 cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-violet to-nebula-magenta shadow-neon-sm flex items-center justify-center">
                                <HardDrive className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{bay.name}</h3>
                                <p className="text-xs text-gray-500">{bay.location}</p>
                              </div>
                            </div>
                            <Badge variant={bay.status as any}>{bay.status}</Badge>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-gray-500 text-xs mb-1">Temp.</p>
                              <p className="font-semibold text-gray-200">{formatTemperature(bay.sensors.temperature.value)}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-gray-500 text-xs mb-1">Humid.</p>
                              <p className="font-semibold text-gray-200">{formatHumidity(bay.sensors.humidity.value)}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-gray-500 text-xs mb-1">Power</p>
                              <p className="font-semibold text-yellow-400">{bay.powerConsumption.toFixed(1)} kW</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-gray-500 text-xs mb-1">Réseau</p>
                              <p className="font-semibold text-green-400">
                                {bay.networkUsage.inbound.toFixed(0)} Mb/s
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            {/* Sensors Tab */}
            <TabsContent value="sensors">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-white/5 bg-white/[0.02]">
                  <CardHeader>
                    <CardTitle className="text-white">Capteurs Environnementaux</CardTitle>
                    <CardDescription>Moyennes du site</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <SensorGauge
                      value={avgTemp}
                      maxValue={40}
                      unit="°C"
                      label="Température"
                      status={avgTemp > 30 ? "critical" : avgTemp > 25 ? "warning" : "ok"}
                      size="md"
                    />
                    <SensorGauge
                      value={avgHumidity}
                      maxValue={100}
                      unit="%"
                      label="Humidité"
                      status={avgHumidity > 70 ? "critical" : avgHumidity > 60 ? "warning" : "ok"}
                      size="md"
                    />
                  </CardContent>
                </Card>

                <Card className="border-white/5 bg-white/[0.02]">
                  <CardHeader>
                    <CardTitle className="text-white">Statistiques Techniques</CardTitle>
                    <CardDescription>Données consolidées</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Consommation Totale</span>
                        <span className="text-lg font-bold text-yellow-400">{totalPower.toFixed(1)} kW</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Trafic Réseau Moyen</span>
                        <span className="text-lg font-bold text-green-400">{avgNetwork.toFixed(0)} Mb/s</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Disponibilité</span>
                        <span className="text-lg font-bold text-green-400">{site.uptime}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-white">Utilisation Réseau</CardTitle>
                  <CardDescription>Détails par baie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bays.map((bay, index) => (
                      <motion.div
                        key={bay.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:border-nebula-cyan/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-200">{bay.name}</span>
                          <Network className="w-5 h-5 text-nebula-cyan" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">⬇ Entrant</p>
                            <p className="text-lg font-semibold text-green-400">{bay.networkUsage.inbound.toFixed(1)} Mb/s</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">⬆ Sortant</p>
                            <p className="text-lg font-semibold text-blue-400">{bay.networkUsage.outbound.toFixed(1)} Mb/s</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-white">Historique Température</CardTitle>
                  <CardDescription>12 dernières heures</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tempHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 26, 0.98)',
                          border: '1px solid rgba(106, 0, 255, 0.2)',
                          borderRadius: '12px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#C300FF" 
                        strokeWidth={2}
                        dot={{ fill: '#C300FF', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
