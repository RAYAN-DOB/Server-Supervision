"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, AlertCircle, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { AddressBadge, ZabbixBadge } from "@/components/ui/status-badge";
import { useSitesReference } from "@/hooks/useSitesReference";
import Link from "next/link";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(
  () => import("@/components/features/interactive-map").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-white/[0.02]">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-gray-400">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
);

const CENTER: [number, number] = [48.8064, 2.4379];

export default function CartePage() {
  const { sites, loading, stats } = useSitesReference();
  const [filter, setFilter] = useState<"all" | "zabbix" | "dsi" | "nocoords">("all");

  const filteredForMap = sites.filter((s) => {
    if (!s.visibleOnMap) return false;
    if (s.lat == null || s.lng == null) return false;
    if (filter === "zabbix") return s.zabbixStatus === "connected" || s.zabbixStatus === "partial";
    if (filter === "dsi") return s.likelyManagedByDSI;
    return true;
  });

  const sitesWithoutCoords = sites.filter((s) => s.lat == null || s.lng == null);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
          <MapPin className="w-6 h-6 text-purple-400" />
          Carte des sites
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {stats.withCoordinates} sites géolocalisés sur {stats.total} · {stats.withoutCoordinates} sans coordonnées
        </p>
      </motion.div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "all",     label: "Tous les sites",   count: filteredForMap.length },
          { id: "dsi",     label: "Gérés par la DSI", count: sites.filter(s => s.likelyManagedByDSI && s.lat != null).length },
          { id: "zabbix",  label: "Avec Zabbix",      count: stats.connectedZabbix },
          { id: "nocoords",label: "Sans coordonnées", count: stats.withoutCoordinates },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === id
                ? "bg-purple-600/30 border-purple-500/40 text-purple-300"
                : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white"
            }`}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Carte principale */}
      <Card className="border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
        <CardContent className="p-0">
          <div className="relative w-full overflow-hidden" style={{ height: "min(70vh, 620px)" }}>
            {!loading && filter !== "nocoords" ? (
              <InteractiveMap
                referenceMode
                siteReferences={filteredForMap}
                center={CENTER}
                showLegend
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white/[0.02]">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">
                    {loading
                      ? "Chargement..."
                      : `${sitesWithoutCoords.length} site(s) sans coordonnées GPS`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sites sans coordonnées (alerte) */}
      {sitesWithoutCoords.length > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-300">
                  {sitesWithoutCoords.length} site{sitesWithoutCoords.length > 1 ? "s" : ""} sans coordonnées GPS
                </p>
                <p className="text-xs text-orange-400/70 mt-1">
                  Ces sites sont dans le référentiel mais ne peuvent pas être affichés sur la carte.
                  Géocodage à prévoir.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {sitesWithoutCoords.slice(0, 8).map((s) => (
                    <Link key={s.id} href={`/sites/${s.id}`}>
                      <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded px-2 py-0.5 hover:bg-orange-500/20 transition-colors cursor-pointer">
                        {s.id}
                      </span>
                    </Link>
                  ))}
                  {sitesWithoutCoords.length > 8 && (
                    <span className="text-xs text-orange-400/60">+{sitesWithoutCoords.length - 8} autres</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grille des sites */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {filter === "nocoords"
          ? `Sites sans coordonnées (${sitesWithoutCoords.length})`
          : `Sites sur la carte (${filteredForMap.length})`}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {(filter === "nocoords" ? sitesWithoutCoords : filteredForMap).map((site, i) => (
          <Link key={site.id} href={`/sites/${site.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border-white/[0.06] bg-white/[0.02] hover:border-purple-500/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{site.name}</p>
                        <p className="text-[10px] font-mono text-gray-600">{site.id}</p>
                      </div>
                    </div>
                    {site.likelyManagedByDSI && (
                      <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-1.5 py-0.5 whitespace-nowrap">
                        DSI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                    {site.address ?? "Adresse non renseignée"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <AddressBadge status={site.addressStatus} />
                    <ZabbixBadge status={site.zabbixStatus} />
                    {(site.ltCount ?? 0) > 0 && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-1.5 py-0.5">
                        {site.ltCount} LT
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
