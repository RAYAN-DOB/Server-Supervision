"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  AlertTriangle, 
  Thermometer, 
  Activity,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES, MOCK_ALERTS } from "@/data/mock-sites";
import { formatRelativeTime, cn } from "@/lib/utils";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { sites, alerts, setSites, setAlerts } = useStore();
  const [avgTemp, setAvgTemp] = useState(22.5);
  const [tempData, setTempData] = useState<any[]>([]);

  useEffect(() => {
    if (sites.length === 0) setSites(MOCK_SITES);
    if (alerts.length === 0) setAlerts(MOCK_ALERTS);

    const tempHistory = Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      temperature: 22 + Math.sin((i / 24) * Math.PI * 2) * 2 + Math.random() * 0.5,
    })).reverse();
    setTempData(tempHistory);

    const interval = setInterval(() => {
      setAvgTemp(22 + Math.sin(Date.now() / 10000) * 2);
    }, 2000);

    return () => clearInterval(interval);
  }, [sites.length, alerts.length, setSites, setAlerts]);

  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const totalBays = sites.reduce((sum, site) => sum + site.bayCount, 0);
  const avgUptime = sites.reduce((sum, site) => sum + site.uptime, 0) / (sites.length || 1);

  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const criticalSites = sites.filter(s => s.status === "critical" || s.status === "warning").slice(0, 3);

  const stats = [
    { 
      label: "Sites Municipaux", 
      value: sites.length, 
      subtitle: `${totalBays} baies réseau`,
      icon: Building2, 
      trend: "Tous surveillés",
      color: "cyan",
    },
    { 
      label: "Alertes Actives", 
      value: activeAlerts.length,
      subtitle: `${criticalAlerts.length} critiques`,
      icon: AlertTriangle, 
      trend: criticalAlerts.length > 0 ? "Action requise" : "Tout OK",
      color: criticalAlerts.length > 0 ? "red" : "green",
    },
    { 
      label: "Température", 
      value: `${avgTemp.toFixed(1)}°C`,
      subtitle: "Moyenne globale",
      icon: Thermometer, 
      trend: avgTemp > 24 ? "+1.2°C" : "Normal",
      color: avgTemp > 24 ? "orange" : "green",
    },
    { 
      label: "Disponibilité", 
      value: `${avgUptime.toFixed(1)}%`,
      subtitle: "30 derniers jours",
      icon: Activity, 
      trend: avgUptime >= 99.5 ? "Objectif atteint" : "À améliorer",
      color: "green",
    },
  ];

  return (
    <>
      <TopBar />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tableau de Bord Principal
          </h1>
          <p className="text-gray-500 font-light">
            Vue d'ensemble de l'infrastructure IT municipale
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="clean-card p-6 h-full cursor-default">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/[0.04] text-gray-400">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mb-1 font-light">{stat.label}</div>
                  <div className="text-xs text-gray-600 font-light">{stat.subtitle}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Temperature Chart */}
          <div className="lg:col-span-2">
            <div className="clean-card p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Température (24h)</h3>
                <p className="text-sm text-gray-500 font-light">Évolution moyenne tous sites</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={tempData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="time" stroke="#444" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(2, 2, 8, 0.98)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#8A2BE2" 
                    strokeWidth={2}
                    fill="url(#tempGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="clean-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Navigation Rapide</h3>
              <div className="space-y-2">
                {[
                  { label: "Voir la Carte", href: "/carte", icon: MapPin },
                  { label: "Tous les Sites", href: "/sites", icon: Building2 },
                  { label: "Centre d'Alertes", href: "/alertes", icon: AlertTriangle },
                  { label: "Générer Rapport", href: "/rapports", icon: Zap },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="clean-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Alertes Récentes</h3>
              <Link href="/alertes">
                <span className="text-xs text-gray-500 hover:text-purple-400 transition-colors cursor-pointer">
                  Tout voir →
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5",
                    alert.severity === "critical" && "bg-red-500",
                    alert.severity === "major" && "bg-orange-500",
                    alert.severity === "minor" && "bg-yellow-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{alert.title}</p>
                    <p className="text-xs text-gray-600 truncate">{alert.siteName}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Critical Sites */}
          <div className="clean-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Sites à Surveiller</h3>
              <Link href="/sites">
                <span className="text-xs text-gray-500 hover:text-purple-400 transition-colors cursor-pointer">
                  Tout voir →
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {criticalSites.length > 0 ? criticalSites.map((site, index) => (
                <Link key={site.id} href={`/sites/${site.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{site.name}</p>
                        <p className="text-xs text-gray-600">{site.alertCount} alerte{site.alertCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Badge variant={site.status as any} className="text-xs">
                      {site.status}
                    </Badge>
                  </motion.div>
                </Link>
              )) : (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm text-gray-600 font-light">Tous les sites opérationnels</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
