"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Building2,
  BookOpen,
  Wifi,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { useSitesReference } from "@/hooks/useSitesReference";
import { MOCK_SITES } from "@/data/mock-sites";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
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

const CHART_TOOLTIP_STYLE = {
  background: "rgba(2,2,8,0.97)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
  fontSize: "13px",
  color: "#fff",
};

export default function AnalyticsPage() {
  const { sites, setSites } = useStore();
  const { stats: refStats } = useSitesReference();

  useEffect(() => {
    if (sites.length === 0) setSites(MOCK_SITES);
  }, [sites.length, setSites]);

  const tempHistoryData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      date: `J-${30 - i}`,
      avgTemp: +(22 + Math.sin((i / 30) * Math.PI * 2) * 3 + ((i * 7 + 3) % 10) / 20).toFixed(1),
      maxTemp: +(25 + Math.sin((i / 30) * Math.PI * 2) * 3 + ((i * 5 + 1) % 10) / 20).toFixed(1),
      minTemp: +(19 + Math.sin((i / 30) * Math.PI * 2) * 3 + ((i * 3 + 7) % 10) / 20).toFixed(1),
    })),
  []);

  const alertsData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      day: `Jour ${i + 1}`,
      critical: (i * 3 + 1) % 5,
      major: (i * 2 + 3) % 10,
      minor: (i * 4 + 2) % 15,
    })),
  []);

  const sitesByCategoryData = [
    { name: "Administratif", value: 3, color: "#6A00FF" },
    { name: "École", value: 14, color: "#C300FF" },
    { name: "Culture", value: 6, color: "#00F0FF" },
    { name: "Sport", value: 2, color: "#FF00E5" },
    { name: "Sécurité", value: 1, color: "#10b981" },
    { name: "Service municipal", value: 5, color: "#f59e0b" },
    { name: "Quartier", value: 4, color: "#8b5cf6" },
    { name: "Technique", value: 1, color: "#ef4444" },
  ];

  const integrationData = [
    { name: "Connecté Zabbix", value: refStats.connectedZabbix, color: "#3b82f6" },
    { name: "Non connecté", value: refStats.notConnectedZabbix, color: "#6b7280" },
  ];

  const totalPower = sites.reduce((sum, site) => sum + site.powerConsumption, 0);
  const avgTemp = sites.reduce((sum, site) => sum + site.temperature, 0) / (sites.length || 1);

  const powerConsumptionData = sites.map((site) => ({
    name: site.name.length > 12 ? site.name.slice(0, 12) + "..." : site.name,
    consumption: site.powerConsumption,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Analyses détaillées et tableaux de bord</p>
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
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Consommation totale", value: `${totalPower.toFixed(1)} kW`, trend: "-5% vs mois dernier", up: true, icon: Activity, color: "cyan" },
          { label: "Température moyenne", value: `${avgTemp.toFixed(1)}°C`, trend: "+0.8°C vs semaine", up: false, icon: TrendingUp, color: "orange" },
          { label: "Incidents résolus", value: "42", trend: "+12% efficacité", up: true, icon: BarChart3, color: "green" },
          { label: "Disponibilité", value: "99.7%", trend: "Objectif: 99.5%", up: true, icon: PieChart, color: "purple" },
        ].map(({ label, value, trend, up, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <div className={cn("flex items-center gap-1 mt-1 text-xs", up ? "text-green-400" : "text-red-400")}>
                      {up ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      <span>{trend}</span>
                    </div>
                  </div>
                  <Icon className={`w-7 h-7 text-${color}-400 opacity-40`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Température 30j */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Évolution température (30 jours)</CardTitle>
            <p className="text-xs text-gray-500">Température moyenne, minimale et maximale</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tempHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="avgTemp" stroke="#6A00FF" name="Moyenne" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="maxTemp" stroke="#ef4444" name="Max" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="minTemp" stroke="#3b82f6" name="Min" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertes par sévérité */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Alertes par sévérité (7 jours)</CardTitle>
            <p className="text-xs text-gray-500">Évolution des incidents</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="critical" fill="#ef4444" name="Critiques" radius={[2, 2, 0, 0]} />
                <Bar dataKey="major" fill="#f59e0b" name="Majeures" radius={[2, 2, 0, 0]} />
                <Bar dataKey="minor" fill="#eab308" name="Mineures" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Répartition par catégorie */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Répartition par catégorie</CardTitle>
            <p className="text-xs text-gray-500">Distribution des {refStats.total} sites municipaux</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RePieChart>
                <Pie
                  data={sitesByCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sitesByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intégration Zabbix */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              Intégration Zabbix
            </CardTitle>
            <p className="text-xs text-gray-500">{refStats.connectedZabbix} / {refStats.total} sites connectés</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie data={integrationData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {integrationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {integrationData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consommation par site */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Consommation électrique par site</CardTitle>
            <p className="text-xs text-gray-500">Top sites consommateurs (kW)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={powerConsumptionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#555" width={90} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="consumption" fill="#C300FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
