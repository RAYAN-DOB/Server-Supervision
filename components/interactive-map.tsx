"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Site } from "@/types";

// Import Leaflet types only (not the library itself)
type LatLngExpression = [number, number];

// Dynamically import all Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-white/[0.02]">
        <p className="text-gray-400">Chargement de la carte...</p>
      </div>
    ),
  }
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

const MARKER_COLORS: Record<string, { bg: string; border: string }> = {
  ok: { bg: "#22c55e", border: "#16a34a" },
  warning: { bg: "#eab308", border: "#ca8a04" },
  critical: { bg: "#ef4444", border: "#b91c1c" },
  maintenance: { bg: "#3b82f6", border: "#2563eb" },
};

interface InteractiveMapProps {
  sites: Site[];
  center: LatLngExpression;
}

export function InteractiveMap({ sites, center }: InteractiveMapProps) {
  const [markerIcons, setMarkerIcons] = useState<Record<string, any>>({});
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.onload = () => setCssLoaded(true);
      document.head.appendChild(link);

      // Load Leaflet library and create icons
      import("leaflet").then((L) => {
        const icons: Record<string, any> = {};
        Object.keys(MARKER_COLORS).forEach((status) => {
          const c = MARKER_COLORS[status];
          icons[status] = L.divIcon({
            className: "aurion-marker",
            html: `<div style="width:24px;height:24px;background:${c.bg};border:3px solid ${c.border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
          });
        });
        setMarkerIcons(icons);
      });
    }
  }, []);

  if (!cssLoaded || Object.keys(markerIcons).length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white/[0.02]">
        <p className="text-gray-400 animate-pulse">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0 aurion-map-dark"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={site.coordinates as LatLngExpression}
          icon={markerIcons[site.status] || markerIcons.ok}
        >
          <Popup>
            <div className="p-3 min-w-[220px]">
              <h3 className="font-bold mb-2 text-white">{site.name}</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Statut: <span className="font-semibold">{site.status}</span></p>
                <p>Baies: {site.bayCount}</p>
                <p>Alertes: <span className={site.alertCount > 0 ? "text-red-400" : "text-green-400"}>{site.alertCount}</span></p>
                <p>Température: {site.temperature.toFixed(1)}°C</p>
              </div>
              <a href={`/sites/${site.id}`} className="block mt-3">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                  Voir détails
                </button>
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
