"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Search, SlidersHorizontal, Grid3x3, List, MapPin, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mock-sites";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SitesPage() {
  const { sites, setSites, ui, setUIState, filters, setFilters } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (sites.length === 0) setSites(MOCK_SITES);
  }, [sites.length, setSites]);

  const filteredSites = sites.filter(site => {
    if (searchQuery && !site.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.siteType.length > 0 && !filters.siteType.includes(site.type)) return false;
    if (filters.status.length > 0 && !filters.status.includes(site.status)) return false;
    return true;
  });

  const stats = {
    total: sites.length,
    ok: sites.filter(s => s.status === "ok").length,
    warning: sites.filter(s => s.status === "warning").length,
    critical: sites.filter(s => s.status === "critical").length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Sites Municipaux
            </h1>
            <p className="text-gray-500 font-light">
              {filteredSites.length} site{filteredSites.length > 1 ? 's' : ''} sur {sites.length}
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: stats.total, variant: "default" },
              { label: "Opérationnels", value: stats.ok, variant: "ok" },
              { label: "Avertissement", value: stats.warning, variant: "warning" },
              { label: "Critiques", value: stats.critical, variant: "critical" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="clean-card p-4 cursor-default text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Rechercher un site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/[0.12] transition-all font-light"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-4 py-3 rounded-xl border transition-all text-sm font-medium flex items-center gap-2",
                  showFilters 
                    ? "bg-white/[0.08] border-white/[0.12] text-white" 
                    : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06]"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="clean-card p-4 space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 font-light mr-2">Type:</span>
                  {["administratif", "sport", "education", "culture", "securite", "technique"].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        if (filters.siteType.includes(type)) {
                          setFilters({ siteType: filters.siteType.filter(t => t !== type) });
                        } else {
                          setFilters({ siteType: [...filters.siteType, type] });
                        }
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize",
                        filters.siteType.includes(type)
                          ? "bg-nebula-violet/20 text-nebula-violet border border-nebula-violet/30"
                          : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:bg-white/[0.06]"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sites Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site, index) => (
              <Link key={site.id} href={`/sites/${site.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="clean-card p-6 h-full cursor-pointer group">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-violet/20 to-nebula-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="w-5 h-5 text-nebula-violet" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-base mb-0.5 group-hover:text-nebula-violet transition-colors">
                            {site.name}
                          </h3>
                          <p className="text-xs text-gray-600 font-light">{site.bayCount} baies</p>
                        </div>
                      </div>
                      <Badge variant={site.status as any} className="text-[10px] px-2 py-0.5">
                        {site.status}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-xs text-gray-600 mb-1 font-light">Temp.</p>
                        <p className="text-sm font-semibold text-gray-300">{site.temperature.toFixed(1)}°C</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-xs text-gray-600 mb-1 font-light">Humid.</p>
                        <p className="text-sm font-semibold text-gray-300">{site.humidity}%</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-xs text-gray-600 mb-1 font-light">Uptime</p>
                        <p className="text-sm font-semibold text-green-400">{site.uptime}%</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <span className="text-xs text-gray-600 capitalize font-light">{site.type}</span>
                      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-nebula-violet group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {filteredSites.length === 0 && (
            <div className="clean-card p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucun site trouvé</h3>
              <p className="text-sm text-gray-500 font-light mb-4">Essayez de modifier vos filtres ou votre recherche</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ siteType: [], status: [] });
                }}
                className="btn-primary"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
