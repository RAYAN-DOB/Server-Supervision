"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mock-sites";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import du composant Map dynamiquement
const InteractiveMap = dynamic(
  () => import("@/components/interactive-map").then((mod) => mod.InteractiveMap),
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

export default function CartePage() {
  const { sites, setSites } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sites.length === 0) {
      setSites(MOCK_SITES);
    }
  }, [sites.length, setSites]);

  const center: [number, number] = [48.8064, 2.4379];

  return (
    <>

      <div className="p-4 sm:p-6 lg:p-8">
        <Breadcrumbs />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Carte Interactive
          </h1>
          <p className="text-gray-500 font-light">
            Visualisation gÃ©ographique de vos {sites.length} sites municipaux
          </p>
        </motion.div>

        <Card className="border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
          <CardContent className="p-0">
            <div
              className="relative w-full overflow-hidden"
              style={{ height: "min(70vh, 600px)" }}
            >
              {mounted && sites.length > 0 ? (
                <InteractiveMap sites={sites} center={center} />
              ) : (
                <div className="h-full flex items-center justify-center bg-white/[0.02]">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
                    <p className="text-gray-400">Chargement de la carte...</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-[1000] clean-card p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white mb-3">LÃ©gende</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>OK ({sites.filter((s) => s.status === "ok").length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Warning ({sites.filter((s) => s.status === "warning").length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Critical ({sites.filter((s) => s.status === "critical").length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Maintenance ({sites.filter((s) => s.status === "maintenance").length})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site, index) => (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="border-white/[0.06] bg-white/[0.02] hover:border-purple-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                        <h3 className="font-semibold text-sm text-white">{site.name}</h3>
                      </div>
                      <Badge variant={site.status as any} className="text-xs shrink-0">{site.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">{site.address}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Baies</p>
                        <p className="font-semibold text-gray-300">{site.bayCount}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Alertes</p>
                        <p className={`font-semibold ${site.alertCount > 0 ? "text-red-400" : "text-green-400"}`}>
                          {site.alertCount}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Temp.</p>
                        <p className="font-semibold text-gray-300">{site.temperature.toFixed(1)}Â°C</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
