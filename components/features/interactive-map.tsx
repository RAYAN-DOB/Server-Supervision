"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Site, SiteReference } from "@/types";

type LatLngExpression = [number, number];

// Chargement dynamique des composants Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false, loading: () => <MapLoader /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

function MapLoader() {
  return (
    <div className="h-full flex items-center justify-center bg-white/[0.02]">
      <p className="text-gray-400 animate-pulse">Chargement de la carte...</p>
    </div>
  );
}

// ─── Couleurs des marqueurs ───────────────────────────────────────────────────

type MarkerVariant =
  | "verified"          // vert  — adresse vérifiée
  | "needs_validation"  // orange — adresse à valider
  | "internal_only"     // gris  — interne seulement
  | "zabbix_connected"  // bleu  — connecté Zabbix
  | "referenced"        // violet — référencé, non supervisé
  | "critical"          // rouge  — alerte critique
  | "ok"                // vert clair — supervision OK (legacy)
  | "warning"           // jaune — supervision warning (legacy)
  | "maintenance";      // bleu  — maintenance (legacy)

const MARKER_STYLES: Record<MarkerVariant, { bg: string; border: string }> = {
  verified:         { bg: "#22c55e", border: "#16a34a" },
  needs_validation: { bg: "#f97316", border: "#c2410c" },
  internal_only:    { bg: "#6b7280", border: "#4b5563" },
  zabbix_connected: { bg: "#3b82f6", border: "#1d4ed8" },
  referenced:       { bg: "#8b5cf6", border: "#6d28d9" },
  critical:         { bg: "#ef4444", border: "#b91c1c" },
  ok:               { bg: "#22c55e", border: "#16a34a" },
  warning:          { bg: "#eab308", border: "#ca8a04" },
  maintenance:      { bg: "#3b82f6", border: "#2563eb" },
};

function getVariantForRef(site: SiteReference): MarkerVariant {
  if (site.supervisionStatus === "critical") return "critical";
  if (site.zabbixStatus === "connected" || site.zabbixStatus === "partial")
    return "zabbix_connected";
  if (site.addressStatus === "needs_manual_validation") return "needs_validation";
  if (site.addressStatus === "internal_only") return "internal_only";
  return "referenced";
}

function getVariantForSite(site: Site): MarkerVariant {
  return (site.status as MarkerVariant) ?? "ok";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InteractiveMapProps {
  /** Mode référentiel : affiche tous les SiteReference */
  referenceMode?: boolean;
  sites?: Site[];
  siteReferences?: SiteReference[];
  center?: LatLngExpression;
  showLegend?: boolean;
}

export function InteractiveMap({
  referenceMode = false,
  sites = [],
  siteReferences = [],
  center = [48.8064, 2.4379],
  showLegend = true,
}: InteractiveMapProps) {
  const [markerIcons, setMarkerIcons] = useState<Record<string, unknown>>({});
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => setCssLoaded(true);
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      const icons: Record<string, unknown> = {};
      for (const [variant, c] of Object.entries(MARKER_STYLES)) {
        icons[variant] = L.divIcon({
          className: "aurion-marker",
          html: `<div style="width:22px;height:22px;background:${c.bg};border:3px solid ${c.border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        });
      }
      setMarkerIcons(icons);
    });
  }, []);

  if (!cssLoaded || Object.keys(markerIcons).length === 0) {
    return <MapLoader />;
  }

  // Sites sans coordonnées (référentiel uniquement)
  const refsWithCoords = siteReferences.filter(
    (s) => s.lat != null && s.lng != null && s.visibleOnMap
  );
  const refsWithoutCoords = siteReferences.filter(
    (s) => s.lat == null || s.lng == null
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        className="z-0 aurion-map-dark"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Mode référentiel */}
        {referenceMode &&
          refsWithCoords.map((site) => {
            const variant = getVariantForRef(site);
            return (
              <Marker
                key={site.id}
                position={[site.lat!, site.lng!] as LatLngExpression}
                icon={markerIcons[variant] as never}
              >
                <Popup>
                  <div className="p-3 min-w-[240px] max-w-[300px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                          {site.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-mono">{site.id}</p>
                      </div>
                      {site.likelyManagedByDSI && (
                        <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                          DSI
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-300 mb-3">
                      {site.address && (
                        <p className="flex gap-1">
                          <span className="text-gray-500">Adresse :</span>
                          <span>{site.address}, {site.postalCode}</span>
                        </p>
                      )}
                      {(site.ltCount ?? 0) > 0 && (
                        <p className="flex gap-1">
                          <span className="text-gray-500">LT :</span>
                          <span>{site.ltNames.join(", ")}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <AddressStatusPill status={site.addressStatus} />
                        <ZabbixStatusPill status={site.zabbixStatus} />
                        <SensorsStatusPill status={site.sensorsStatus} />
                      </div>
                    </div>

                    <a href={`/sites/${site.id}`}>
                      <button className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                        Voir la fiche
                      </button>
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Mode legacy supervision */}
        {!referenceMode &&
          sites.map((site) => {
            const variant = getVariantForSite(site);
            return (
              <Marker
                key={site.id}
                position={site.coordinates as LatLngExpression}
                icon={markerIcons[variant] as never}
              >
                <Popup>
                  <div className="p-3 min-w-[220px]">
                    <h3 className="font-bold mb-2 text-white">{site.name}</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>Statut : <span className="font-semibold">{site.status}</span></p>
                      <p>Baies : {site.bayCount}</p>
                      <p>
                        Alertes :{" "}
                        <span className={site.alertCount > 0 ? "text-red-400" : "text-green-400"}>
                          {site.alertCount}
                        </span>
                      </p>
                      <p>Température : {site.temperature.toFixed(1)}°C</p>
                    </div>
                    <a href={`/sites/${site.id}`} className="block mt-3">
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                        Voir détails
                      </button>
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Légende */}
      {showLegend && referenceMode && (
        <div className="absolute bottom-4 right-4 z-[400] bg-[#0a0a1a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Légende</p>
          {[
            { color: "#22c55e", label: "Adresse vérifiée" },
            { color: "#f97316", label: "Adresse à valider" },
            { color: "#3b82f6", label: "Connecté Zabbix" },
            { color: "#8b5cf6", label: "Référencé (non supervisé)" },
            { color: "#6b7280", label: "Interne uniquement" },
            { color: "#ef4444", label: "Alerte critique" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] text-gray-300">{label}</span>
            </div>
          ))}
          {refsWithoutCoords.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-[11px] text-orange-400">
                {refsWithoutCoords.length} site{refsWithoutCoords.length > 1 ? "s" : ""} sans coordonnées
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mini pills pour les popups ───────────────────────────────────────────────

function AddressStatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    verified:                { label: "Adresse OK",     cls: "bg-emerald-500/20 text-emerald-300" },
    needs_manual_validation: { label: "À valider",      cls: "bg-orange-500/20 text-orange-300" },
    internal_only:           { label: "Interne",        cls: "bg-gray-500/20 text-gray-300" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-500/20 text-gray-300" };
  return <span className={`text-[10px] rounded-full px-2 py-0.5 ${c.cls}`}>{c.label}</span>;
}

function ZabbixStatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    connected:     { label: "Zabbix ✓",  cls: "bg-blue-500/20 text-blue-300" },
    partial:       { label: "Zabbix ~",  cls: "bg-yellow-500/20 text-yellow-300" },
    pending:       { label: "Zabbix ⏳", cls: "bg-orange-500/20 text-orange-300" },
    not_connected: { label: "Sans Zabbix", cls: "bg-gray-500/20 text-gray-400" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-500/20 text-gray-400" };
  return <span className={`text-[10px] rounded-full px-2 py-0.5 ${c.cls}`}>{c.label}</span>;
}

function SensorsStatusPill({ status }: { status: string }) {
  if (status === "none") return null;
  const cfg: Record<string, { label: string; cls: string }> = {
    active:  { label: "Capteurs actifs",  cls: "bg-emerald-500/20 text-emerald-300" },
    partial: { label: "Capteurs partiels", cls: "bg-yellow-500/20 text-yellow-300" },
  };
  const c = cfg[status];
  if (!c) return null;
  return <span className={`text-[10px] rounded-full px-2 py-0.5 ${c.cls}`}>{c.label}</span>;
}
