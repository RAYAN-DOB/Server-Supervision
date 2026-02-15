"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mock-sites";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { sites, setSites } = useStore();
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "1y">("7d");

  useEffect(() => {
    if (sites.length === 0) {
      setSites(MOCK_SITES);
    }
  }, [sites.length, setSites]);

  // Generate mock data
  const tempHistoryData = Array.from({ length: 30 }, (_, i) => ({
    date: `J-${30 - i}`,
    avgTemp: 22 + Math.sin((i / 30) * Math.PI * 2) * 3 + Math.random() * 0.5,
    maxTemp: 25 + Math.sin((i / 30) * Math.PI * 2) * 3 + Math.random() * 0.5,
    minTemp: 19 + Math.sin((i / 30) * Math.PI * 2) * 3 + Math.random() * 0.5,
  }));

  const alertsData = Array.from({ length: 7 }, (_, i) => ({
    day: `Jour ${i + 1}`,
    critical: Math.floor(Math.random() * 5),
    major: Math.floor(Math.random() * 10),
    minor: Math.floor(Math.random() * 15),
  }));

  const sitesByTypeData = [
    { name: "Administratif", value: sites.filter(s => s.type === "administratif").length, color: "#6A00FF" },
    { name: "Sport", value: sites.filter(s => s.type === "sport").length, color: "#C300FF" },
    { name: "Éducation", value: sites.filter(s => s.type === "education").length, color: "#FF00E5" },
    { name: "Culture", value: sites.filter(s => s.type === "culture").length, color: "#00F0FF" },
    { name: "Sécurité", value: sites.filter(s => s.type === "securite").length, color: "#10b981" },
    { name: "Technique", value: sites.filter(s => s.type === "technique").length, color: "#f59e0b" },
  ];

  const powerConsumptionData = sites.map(site => ({
    name: site.name.split(" ")[0],
    consumption: site.powerConsumption,
  }));

  const totalPower = sites.reduce((sum, site) => sum + site.powerConsumption, 0);
  const avgTemp = sites.reduce((sum, site) => sum + site.temperature, 0) / (sites.length || 1);

  return (
    <div className="min-h-screen">
      <GradientBackground />
      <Navbar />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-2 gradient-text"
              >
                Analytics & Rapports
              </motion.h1>
              <p className="text-gray-400">Analyses détaillées et tableaux de bord</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="glass" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Période
              </Button>
              <Button variant="glass" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </Button>
            </div>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Consommation Totale</p>
                    <p className="text-2xl font-bold gradient-text">{totalPower.toFixed(1)} kW</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                      <TrendingDown className="w-3 h-3" />
                      <span>-5% vs mois dernier</span>
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-nebula-cyan opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Température Moyenne</p>
                    <p className="text-2xl font-bold gradient-text">{avgTemp.toFixed(1)}°C</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>+0.8°C vs semaine</span>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-nebula-magenta opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Incidents Résolus</p>
                    <p className="text-2xl font-bold gradient-text">42</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12% efficacité</span>
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Disponibilité</p>
                    <p className="text-2xl font-bold gradient-text">99.7%</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Objectif: 99.5%</span>
                    </div>
                  </div>
                  <PieChart className="w-8 h-8 text-nebula-violet opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Temperature Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution Température (30 jours)</CardTitle>
                <CardDescription>Température moyenne, minimale et maximale</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tempHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 26, 0.95)",
                        border: "1px solid rgba(106, 0, 255, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgTemp" stroke="#6A00FF" name="Moyenne" strokeWidth={2} />
                    <Line type="monotone" dataKey="maxTemp" stroke="#ef4444" name="Max" strokeWidth={2} />
                    <Line type="monotone" dataKey="minTemp" stroke="#3b82f6" name="Min" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes par Sévérité (7 jours)</CardTitle>
                <CardDescription>Évolution des incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 26, 0.95)",
                        border: "1px solid rgba(106, 0, 255, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="critical" fill="#ef4444" name="Critiques" />
                    <Bar dataKey="major" fill="#f59e0b" name="Majeures" />
                    <Bar dataKey="minor" fill="#eab308" name="Mineures" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sites by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Sites</CardTitle>
                <CardDescription>Distribution par type de site</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={sitesByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sitesByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 26, 0.95)",
                        border: "1px solid rgba(106, 0, 255, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Power Consumption */}
            <Card>
              <CardHeader>
                <CardTitle>Consommation Électrique par Site</CardTitle>
                <CardDescription>Top sites consommateurs (kW)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={powerConsumptionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 26, 0.95)",
                        border: "1px solid rgba(106, 0, 255, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="consumption" fill="#C300FF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
