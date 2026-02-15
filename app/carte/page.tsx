"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { MOCK_SITES } from "@/data/mock-sites";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import Leaflet dynamically to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function CartePage() {
  const { sites, setSites } = useStore();
  const [mounted, setMounted] = useState(false);
  const mapId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (sites.length === 0) {
      setSites(MOCK_SITES);
    }
  }, [sites.length, setSites]);

  useEffect(() => {
    // Cleanup any existing map on unmount
    return () => {
      if (containerRef.current) {
        const container = containerRef.current.querySelector('.leaflet-container');
        if (container && (container as any)._leaflet_id) {
          (container as any)._leaflet_id = undefined;
        }
      }
    };
  }, []);

  const center: [number, number] = [48.8064, 2.4379];

  return (
    <>
      <TopBar />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <Breadcrumbs />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Carte Interactive
          </h1>
          <p className="text-gray-500 font-light">
            Visualisation géographique de vos 12 sites municipaux
          </p>
        </motion.div>

        {/* Map Card */}
        <Card className="border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
          <CardContent className="p-0">
            <div ref={containerRef} className="relative h-[600px] w-full">
              {mounted ? (
                <MapContainer
                  key={`map-${mapId}`}
                  center={center}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  scrollWheelZoom={true}
                  whenCreated={(map) => {
                    // Map created callback
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {sites.map((site) => (
                    <Marker key={site.id} position={site.coordinates}>
                      <Popup>
                        <div className="p-3 min-w-[220px]">
                          <h3 className="font-bold mb-3 text-lg">{site.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Statut:</span>
                              <Badge variant={site.status as any}>{site.status}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Baies:</span>
                              <span className="font-medium">{site.bayCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Alertes:</span>
                              <span className={site.alertCount > 0 ? "text-red-500 font-medium" : "text-green-500"}>
                                {site.alertCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Température:</span>
                              <span className="font-medium">{site.temperature.toFixed(1)}°C</span>
                            </div>
                          </div>
                          <Link href={`/sites/${site.id}`}>
                            <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                              Voir les détails
                            </button>
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
                    <p className="text-gray-400">Chargement de la carte...</p>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 right-4 z-[1000] clean-card p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white mb-3">Légende</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>OK ({sites.filter(s => s.status === "ok").length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Warning ({sites.filter(s => s.status === "warning").length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Critical ({sites.filter(s => s.status === "critical").length})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites Grid Below Map */}
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
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold text-sm text-white">{site.name}</h3>
                      </div>
                      <Badge variant={site.status as any} className="text-xs">{site.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">{site.address}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Baies</p>
                        <p className="font-semibold text-gray-300">{site.bayCount}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Alertes</p>
                        <p className={`font-semibold ${site.alertCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {site.alertCount}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                        <p className="text-gray-600 mb-1">Temp.</p>
                        <p className="font-semibold text-gray-300">{site.temperature.toFixed(1)}°C</p>
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
