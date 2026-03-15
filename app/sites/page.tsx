"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Server,
  X,
  RefreshCw,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AddressBadge, ZabbixBadge, SensorsBadge, DsiBadge } from "@/components/ui/status-badge";
import { useSitesReference } from "@/hooks/useSitesReference";
import type { SiteReference, AddressStatus, ZabbixStatus, SensorsStatus } from "@/types";

// ─── Types filtres / tri ──────────────────────────────────────────────────────

type SortField = keyof SiteReference | "ltCount";
type SortDir = "asc" | "desc";

interface Filters {
  search: string;
  dsiOnly: boolean;
  addressStatus: AddressStatus | "all";
  zabbixStatus: ZabbixStatus | "all";
  sensorsStatus: SensorsStatus | "all";
  hasLT: "all" | "yes" | "no";
  hasCoords: "all" | "yes" | "no";
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  dsiOnly: false,
  addressStatus: "all",
  zabbixStatus: "all",
  sensorsStatus: "all",
  hasLT: "all",
  hasCoords: "all",
};

const PAGE_SIZE = 20;

// ─── Utilitaires export ───────────────────────────────────────────────────────

function exportJSON(sites: SiteReference[]) {
  const blob = new Blob([JSON.stringify(sites, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `referentiel-sites-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(sites: SiteReference[]) {
  const headers = [
    "ID", "Nom", "Alias", "Adresse", "CP", "Ville",
    "LT", "Nb LT", "Téléphonie", "Catégorie", "DSI",
    "Statut adresse", "Statut Zabbix", "Capteurs",
    "Visible carte", "Notes", "Source", "Mise à jour",
  ];
  const rows = sites.map((s) => [
    s.id,
    s.name,
    (s.aliases ?? []).join("|"),
    s.address ?? "",
    s.postalCode,
    s.city,
    s.ltNames.join("|"),
    s.ltCount ?? 0,
    s.telephonyEquipment ?? "",
    s.category ?? "",
    s.likelyManagedByDSI ? "Oui" : "Non",
    s.addressStatus,
    s.zabbixStatus,
    s.sensorsStatus,
    s.visibleOnMap ? "Oui" : "Non",
    s.notes ?? "",
    s.source ?? "",
    s.updatedAt,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `referentiel-sites-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function SitesPage() {
  const { sites, loading, error, reload, stats } = useSitesReference();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      setSort((prev) =>
        prev.field === field
          ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
          : { field, dir: "asc" }
      );
    },
    []
  );

  // ─── Filtrage ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...sites];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.address ?? "").toLowerCase().includes(q) ||
          (s.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
          s.ltNames.some((lt) => lt.toLowerCase().includes(q))
      );
    }
    if (filters.dsiOnly) result = result.filter((s) => s.likelyManagedByDSI);
    if (filters.addressStatus !== "all")
      result = result.filter((s) => s.addressStatus === filters.addressStatus);
    if (filters.zabbixStatus !== "all")
      result = result.filter((s) => s.zabbixStatus === filters.zabbixStatus);
    if (filters.sensorsStatus !== "all")
      result = result.filter((s) => s.sensorsStatus === filters.sensorsStatus);
    if (filters.hasLT === "yes") result = result.filter((s) => (s.ltCount ?? 0) > 0);
    if (filters.hasLT === "no") result = result.filter((s) => (s.ltCount ?? 0) === 0);
    if (filters.hasCoords === "yes")
      result = result.filter((s) => s.lat != null && s.lng != null);
    if (filters.hasCoords === "no")
      result = result.filter((s) => s.lat == null || s.lng == null);

    return result;
  }, [sites, filters]);

  // ─── Tri ──────────────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sort.field] ?? "";
      const vb = (b as unknown as Record<string, unknown>)[sort.field] ?? "";
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "fr");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // ─── Pagination ───────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount = [
    filters.dsiOnly,
    filters.addressStatus !== "all",
    filters.zabbixStatus !== "all",
    filters.sensorsStatus !== "all",
    filters.hasLT !== "all",
    filters.hasCoords !== "all",
  ].filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              Référentiel des Sites
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} sites municipaux · {stats.dsiManaged} gérés par la DSI ·{" "}
              {stats.connectedZabbix} connectés Zabbix
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reload}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-gray-400 hover:text-white"
              title="Recharger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportCSV(sorted)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-gray-300 text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportJSON(sorted)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-gray-300 text-sm"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total sites", value: stats.total, icon: Building2, color: "purple" },
          { label: "Gérés DSI", value: stats.dsiManaged, icon: Server, color: "violet" },
          { label: "Avec Zabbix", value: stats.connectedZabbix, icon: Wifi, color: "blue" },
          { label: "Sans Zabbix", value: stats.notConnectedZabbix, icon: WifiOff, color: "gray" },
          { label: "Adresse vérifiée", value: stats.addressVerified, icon: CheckCircle2, color: "green" },
          { label: "À valider", value: stats.addressNeedsValidation, icon: AlertCircle, color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4",
                  color === "purple" && "text-purple-400",
                  color === "violet" && "text-violet-400",
                  color === "blue" && "text-blue-400",
                  color === "gray" && "text-gray-400",
                  color === "green" && "text-green-400",
                  color === "orange" && "text-orange-400",
                )} />
                <span className="text-[11px] text-gray-500">{label}</span>
              </div>
              <p className="text-xl font-bold text-white mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barre de recherche + filtres */}
      <Card className="bg-white/[0.03] border-white/[0.06] mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, adresse, LT..."
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
              />
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="bg-purple-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Effacer
              </button>
            )}
          </div>

          {/* Panneau filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* DSI uniquement */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.dsiOnly}
                      onChange={(e) => setFilter("dsiOnly", e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                    />
                    <span className="text-sm text-gray-300">DSI uniquement</span>
                  </label>

                  {/* Statut adresse */}
                  <select
                    value={filters.addressStatus}
                    onChange={(e) => setFilter("addressStatus", e.target.value as Filters["addressStatus"])}
                    className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Toutes les adresses</option>
                    <option value="verified">Vérifiée</option>
                    <option value="needs_manual_validation">À valider</option>
                    <option value="internal_only">Interne</option>
                  </select>

                  {/* Statut Zabbix */}
                  <select
                    value={filters.zabbixStatus}
                    onChange={(e) => setFilter("zabbixStatus", e.target.value as Filters["zabbixStatus"])}
                    className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Tout Zabbix</option>
                    <option value="connected">Connecté</option>
                    <option value="partial">Partiel</option>
                    <option value="pending">En attente</option>
                    <option value="not_connected">Non connecté</option>
                  </select>

                  {/* Capteurs */}
                  <select
                    value={filters.sensorsStatus}
                    onChange={(e) => setFilter("sensorsStatus", e.target.value as Filters["sensorsStatus"])}
                    className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Tous capteurs</option>
                    <option value="active">Actifs</option>
                    <option value="partial">Partiels</option>
                    <option value="none">Aucun</option>
                  </select>

                  {/* LT */}
                  <select
                    value={filters.hasLT}
                    onChange={(e) => setFilter("hasLT", e.target.value as Filters["hasLT"])}
                    className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Tous (LT)</option>
                    <option value="yes">Avec LT</option>
                    <option value="no">Sans LT</option>
                  </select>

                  {/* Coordonnées */}
                  <select
                    value={filters.hasCoords}
                    onChange={(e) => setFilter("hasCoords", e.target.value as Filters["hasCoords"])}
                    className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">Toutes coords</option>
                    <option value="yes">Avec coordonnées</option>
                    <option value="no">Sans coordonnées</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="text-xs text-gray-600 mb-2 pl-1">
        {sorted.length} résultat{sorted.length !== 1 ? "s" : ""}
        {filters.search || activeFilterCount > 0 ? ` sur ${stats.total}` : ""}
        {" · "} page {page}/{totalPages}
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-400 animate-pulse">Chargement du référentiel...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-red-400">{error}</div>
        </div>
      ) : (
        <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {(
                    [
                      { label: "ID",        field: "id",         cls: "w-24" },
                      { label: "Nom",       field: "name",       cls: "min-w-[180px]" },
                      { label: "Adresse",   field: "address",    cls: "min-w-[200px]" },
                      { label: "LT",        field: "ltCount",    cls: "w-32" },
                      { label: "Catégorie", field: "category",   cls: "w-36" },
                      { label: "DSI",       field: "likelyManagedByDSI", cls: "w-24" },
                      { label: "Adresse",   field: "addressStatus", cls: "w-32" },
                      { label: "Zabbix",    field: "zabbixStatus",  cls: "w-32" },
                      { label: "Capteurs",  field: "sensorsStatus", cls: "w-28" },
                      { label: "Carte",     field: "visibleOnMap",  cls: "w-20" },
                    ] as { label: string; field: SortField; cls: string }[]
                  ).map(({ label, field, cls }) => (
                    <th
                      key={field}
                      className={`px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none ${cls}`}
                      onClick={() => handleSort(field)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {sort.field === field ? (
                          sort.dir === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence mode="wait">
                  {paginated.map((site, i) => (
                    <motion.tr
                      key={site.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.04] hover:shadow-[inset_0_0_30px_rgba(106,0,255,0.05)] transition-all group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          {site.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white leading-tight">{site.name}</p>
                        {site.aliases && site.aliases.length > 0 && (
                          <p className="text-[11px] text-gray-600 truncate max-w-[160px]">
                            {site.aliases.join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 text-xs leading-tight">
                          {site.address ?? <span className="text-gray-600 italic">Non renseignée</span>}
                        </p>
                        {site.address && (
                          <p className="text-[11px] text-gray-600">
                            {site.postalCode} {site.city}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(site.ltCount ?? 0) > 0 ? (
                          <div>
                            <span className="text-white font-medium">{site.ltCount}</span>
                            <p className="text-[11px] text-gray-600 truncate max-w-[110px]">
                              {site.ltNames.join(", ")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 capitalize">
                          {site.category ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DsiBadge managed={site.likelyManagedByDSI} />
                      </td>
                      <td className="px-4 py-3">
                        <AddressBadge status={site.addressStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <ZabbixBadge status={site.zabbixStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <SensorsBadge status={site.sensorsStatus} />
                      </td>
                      <td className="px-4 py-3">
                        {site.visibleOnMap && site.lat != null ? (
                          <MapPin className="w-4 h-4 text-green-400" />
                        ) : (
                          <MapPin className="w-4 h-4 text-gray-700" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/sites/${site.id}`}>
                          <button className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors opacity-0 group-hover:opacity-100">
                            Fiche
                          </button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-600">
                      Aucun site ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Préc.
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : i < 3 ? i + 1 : totalPages - 3 + i - 3;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        p === page
                          ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                          : "text-gray-500 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Suiv. →
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
