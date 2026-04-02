"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Thermometer,
  Droplets,
  Activity,
  Zap,
  ChevronRight,
  RefreshCw,
  Download,
  HardDrive,
  Phone,
  Info,
  History,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Images,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressBadge, ZabbixBadge, SensorsBadge, DsiBadge, SupervisionBadge } from "@/components/ui/status-badge";
import { useStore } from "@/store/useStore";
import { useSitesReference } from "@/hooks/useSitesReference";
import { useSiteMedia } from "@/hooks/useSiteMedia";
import { MOCK_SITES, generateBaysForSite } from "@/data/mocks";
import { formatTemperature } from "@/lib/utils";
import type { Bay } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MediaGallery } from "@/components/features/media-gallery";
import { hasSensorType } from "@/lib/blackbox-refs";

export default function SiteDetailPage() {
  const params = useParams();
  const siteId = params.id as string;

  const { sites, setSites } = useStore();
  const { getSiteById, loading: refLoading } = useSitesReference();

  const [bays, setBays] = useState<Bay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempHistory, setTempHistory] = useState<{ time: string; temperature: number }[]>([]);

  const supervisionSite = sites.find((s) => s.id === siteId);
  const refSite = getSiteById(siteId);
  const { media, loading: mediaLoading, error: mediaError } = useSiteMedia(siteId);

  useEffect(() => {
    if (sites.length === 0) setSites(MOCK_SITES);
  }, [sites.length, setSites]);

  useEffect(() => {
    if (supervisionSite) {
      const siteBays = generateBaysForSite(supervisionSite.id, supervisionSite.name, supervisionSite.bayCount);
      setBays(siteBays);
      const history = Array.from({ length: 12 }, (_, i) => ({
        time: `${11 - i}h`,
        temperature: supervisionSite.temperature + Math.sin(i / 3) * 1.5,
      })).reverse();
      setTempHistory(history);
      setLoading(false);
    } else if (!refLoading) {
      setLoading(false);
    }
  }, [supervisionSite, refLoading]);

  if (loading || refLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker">
        <GradientBackground />
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!supervisionSite && !refSite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker">
        <GradientBackground />
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-gray-300 text-lg font-semibold">Site introuvable</p>
          <p className="text-gray-600 text-sm mb-4">ID : {siteId}</p>
          <Link href="/sites">
            <Button variant="glass">Retour au référentiel</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = refSite?.name ?? supervisionSite?.name ?? siteId;
  const displayAddress = refSite?.address ?? supervisionSite?.address ?? "—";

  // KPIs supervision
  const avgTemp = supervisionSite && hasSensorType(siteId, "temperature")
    ? bays.reduce((sum, b) => sum + b.sensors.temperature.value, 0) / (bays.length || 1)
    : null;
  const avgHumidity = supervisionSite && hasSensorType(siteId, "humidity")
    ? bays.reduce((sum, b) => sum + b.sensors.humidity.value, 0) / (bays.length || 1)
    : null;
  const totalPower = supervisionSite
    ? bays.reduce((sum, b) => sum + b.powerConsumption, 0)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker">
      <GradientBackground />
      <Navbar />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/sites" className="hover:text-purple-400 transition-colors">
            Référentiel
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-300">{displayName}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 shadow-lg flex-shrink-0"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              >
                {displayName}
              </motion.h1>
              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{displayAddress}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="font-mono text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                  {siteId}
                </span>
                {refSite && <DsiBadge managed={refSite.likelyManagedByDSI} size="md" />}
                {refSite && <AddressBadge status={refSite.addressStatus} size="md" />}
                {refSite && <ZabbixBadge status={refSite.zabbixStatus} size="md" />}
                {supervisionSite && (
                  <SupervisionBadge status={supervisionSite.status} size="md" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {bays.length > 0 && (
              <Link href={`/sites/${siteId}/baies/${bays[0].id}`}>
                <Button variant="glass" size="sm">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Voir les baies
                </Button>
              </Link>
            )}
            {refSite?.lat && refSite?.lng && (
              <Link href="/carte">
                <Button variant="glass" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Carte
                </Button>
              </Link>
            )}
            <Button variant="glass" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Rapport
            </Button>
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue={refSite ? "general" : "supervision"} className="space-y-6">
          <TabsList className="bg-white/[0.04] border border-white/[0.08]">
            {refSite && (
              <TabsTrigger value="general" className="data-[state=active]:bg-purple-600/30">
                <Info className="w-4 h-4 mr-2" />
                Informations générales
              </TabsTrigger>
            )}
            {supervisionSite && (
              <TabsTrigger value="supervision" className="data-[state=active]:bg-purple-600/30">
                <Activity className="w-4 h-4 mr-2" />
                État technique
              </TabsTrigger>
            )}
            {refSite && (
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600/30">
                <History className="w-4 h-4 mr-2" />
                Historique
              </TabsTrigger>
            )}
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600/30">
              <Images className="w-4 h-4 mr-2" />
              Galerie
              {media.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-purple-500/30 text-purple-300 rounded-full px-1.5 py-0.5">
                  {media.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Onglet : Informations générales ─────────────────────────────── */}
          {refSite && (
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne gauche : infos principales */}
                <div className="lg:col-span-2 space-y-4">
                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader>
                      <CardTitle className="text-base">Identification</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoRow label="Identifiant" value={refSite.id} mono />
                      <InfoRow label="Nom" value={refSite.name} />
                      <InfoRow
                        label="Alias"
                        value={(refSite.aliases ?? []).join(", ") || "—"}
                      />
                      <InfoRow
                        label="Catégorie"
                        value={<span className="capitalize">{refSite.category ?? "—"}</span>}
                      />
                      <InfoRow
                        label="Géré par la DSI"
                        value={<DsiBadge managed={refSite.likelyManagedByDSI} size="md" />}
                      />
                      <InfoRow
                        label="Téléphonie"
                        value={
                          refSite.telephonyEquipment ? (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-cyan-400" />
                              {refSite.telephonyEquipment}
                            </span>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <InfoRow label="Source" value={refSite.source ?? "—"} />
                      <InfoRow
                        label="Visible sur carte"
                        value={
                          refSite.visibleOnMap ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />Oui
                            </span>
                          ) : (
                            <span className="text-gray-500">Non</span>
                          )
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader>
                      <CardTitle className="text-base">Localisation</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoRow
                        label="Adresse"
                        value={refSite.address ?? "Non renseignée"}
                        wide
                      />
                      <InfoRow label="Code postal" value={refSite.postalCode} />
                      <InfoRow label="Ville" value={refSite.city} />
                      <InfoRow
                        label="Statut adresse"
                        value={<AddressBadge status={refSite.addressStatus} size="md" />}
                      />
                      <InfoRow
                        label="Coordonnées GPS"
                        value={
                          refSite.lat != null && refSite.lng != null ? (
                            <span className="font-mono text-xs text-cyan-400">
                              {refSite.lat.toFixed(4)}, {refSite.lng.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-orange-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Non géocodé
                            </span>
                          )
                        }
                      />
                    </CardContent>
                  </Card>

                  {/* Locaux Techniques */}
                  {(refSite.ltCount ?? 0) > 0 && (
                    <Card className="bg-white/[0.02] border-white/[0.06]">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Locaux Techniques ({refSite.ltCount})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {refSite.ltNames.map((lt) => (
                            <span
                              key={lt}
                              className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg px-3 py-1.5 text-sm font-mono"
                            >
                              {lt}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Infrastructure Baies */}
                  {(refSite.ltCount ?? 0) > 0 && (
                    <Card className="bg-white/[0.02] border-white/[0.06]">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-gray-400" />
                          Baies / Infrastructure IT
                          <span className={`ml-auto text-[10px] border rounded-full px-2 py-0.5 ${
                            refSite.blackboxInstalled
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          }`}>
                            {refSite.blackboxInstalled ? "Supervisé — BlackBox" : "Non supervisé"}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {refSite.ltNames.map((lt, i) => (
                            <div
                              key={lt}
                              className={`p-3 rounded-xl border text-center ${
                                refSite.blackboxInstalled
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : "bg-white/[0.02] border-white/[0.06]"
                              }`}
                            >
                              <HardDrive className={`w-5 h-5 mx-auto mb-1 ${refSite.blackboxInstalled ? "text-emerald-400" : "text-gray-600"}`} />
                              <p className="text-xs font-mono text-gray-300">{lt}</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">
                                {refSite.blackboxInstalled ? "Baie BlackBox" : `Baie ${i + 1}`}
                              </p>
                              {!refSite.blackboxInstalled && (
                                <span className="text-[9px] text-gray-600 italic">non supervisé</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {!refSite.blackboxInstalled && (
                          <p className="text-xs text-gray-600 mt-3 text-center italic">
                            Ces baies existent physiquement mais ne sont pas encore équipées de capteurs.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* BlackBox ServSensor */}
                  {refSite.blackboxInstalled && (
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-300">BlackBox ServSensor</span>
                          <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                            Installé
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        {refSite.blackboxModel && (
                          <InfoRow label="Modèle" value={refSite.blackboxModel} />
                        )}
                        {refSite.blackboxSerial && (
                          <InfoRow label="N° de série" value={refSite.blackboxSerial} mono />
                        )}
                        {refSite.blackboxFirmware && (
                          <InfoRow label="Firmware" value={refSite.blackboxFirmware} mono />
                        )}
                        {refSite.blackboxBayCount != null && (
                          <InfoRow label="Baies supervisées" value={`${refSite.blackboxBayCount} baie(s)`} />
                        )}
                        {refSite.blackboxInstalledAt && (
                          <InfoRow
                            label="Installé le"
                            value={new Date(refSite.blackboxInstalledAt).toLocaleDateString("fr-FR")}
                          />
                        )}
                        {refSite.blackboxInstalledBy && (
                          <InfoRow label="Installé par" value={refSite.blackboxInstalledBy} />
                        )}
                        <div className="col-span-2 mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                          <span className="font-semibold">Note :</span> Les données de supervision sont simulées localement. L&apos;intégration Zabbix est en cours de finalisation — les données seront synchronisées automatiquement une fois l&apos;API connectée.
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Colonne droite : statuts + notes */}
                <div className="space-y-4">
                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader>
                      <CardTitle className="text-base">Statuts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Adresse</span>
                        <AddressBadge status={refSite.addressStatus} size="md" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Zabbix</span>
                        <ZabbixBadge status={refSite.zabbixStatus} size="md" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Capteurs</span>
                        <SensorsBadge status={refSite.sensorsStatus} size="md" />
                      </div>
                      {supervisionSite && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Supervision</span>
                          <SupervisionBadge status={supervisionSite.status} size="md" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {refSite.notes && (
                    <Card className="bg-amber-500/5 border-amber-500/20">
                      <CardHeader>
                        <CardTitle className="text-base text-amber-400">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300">{refSite.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader>
                      <CardTitle className="text-base">Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Créé le</span>
                        <span className="text-gray-300">
                          {new Date(refSite.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mis à jour</span>
                        <span className="text-gray-300">
                          {new Date(refSite.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* ─── Onglet : État technique (supervision) ───────────────────────── */}
          {supervisionSite && (
            <TabsContent value="supervision" className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/[0.02] border-white/[0.06]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Baies</p>
                      <p className="text-2xl font-bold text-cyan-400">{supervisionSite.bayCount}</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-cyan-400 opacity-30" />
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.02] border-white/[0.06]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Alertes</p>
                      <p className={`text-2xl font-bold ${supervisionSite.alertCount > 0 ? "text-red-400" : "text-green-400"}`}>
                        {supervisionSite.alertCount}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-red-400 opacity-30" />
                  </CardContent>
                </Card>
                {avgTemp != null && (
                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Température</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {formatTemperature(avgTemp)}
                        </p>
                      </div>
                      <Thermometer className="w-8 h-8 text-orange-400 opacity-30" />
                    </CardContent>
                  </Card>
                )}
                {avgHumidity != null && (
                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Humidité</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {avgHumidity.toFixed(0)}%
                        </p>
                      </div>
                      <Droplets className="w-8 h-8 text-cyan-400 opacity-30" />
                    </CardContent>
                  </Card>
                )}
                {totalPower != null && (
                  <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Consommation</p>
                        <p className="text-2xl font-bold text-yellow-400">{totalPower.toFixed(0)}W</p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-400 opacity-30" />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Graphique température */}
              {tempHistory.length > 0 && (
                <Card className="bg-white/[0.02] border-white/[0.06]">
                  <CardHeader>
                    <CardTitle className="text-base">Historique température (12h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={tempHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: "#0a0a1a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#9ca3af" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Liste des baies */}
              {bays.length > 0 && (
                <Card className="bg-white/[0.02] border-white/[0.06]">
                  <CardHeader>
                    <CardTitle className="text-base">Baies / Racks ({bays.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bays.map((bay) => (
                        <Link key={bay.id} href={`/sites/${siteId}/baies/${bay.id}`}>
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-white">{bay.name}</span>
                              <Badge variant={bay.status as never} className="text-[10px]">
                                {bay.status}
                              </Badge>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Thermometer className="w-3 h-3" />
                                {bay.sensors.temperature.value.toFixed(1)}°C
                              </span>
                              <span className="flex items-center gap-1">
                                <Droplets className="w-3 h-3" />
                                {bay.sensors.humidity.value.toFixed(0)}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {bay.powerConsumption}W
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* ─── Onglet : Historique ─────────────────────────────────────────── */}
          {/* ─── Onglet : Galerie multimédia ─────────────────────────────────── */}
          <TabsContent value="gallery">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Images className="w-4 h-4 text-purple-400" />
                  Galerie multimédia
                  {media.length > 0 && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 rounded-full px-2 py-0.5">
                      {media.length} fichier{media.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaGallery
                  siteId={siteId}
                  media={media}
                  loading={mediaLoading}
                  error={mediaError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {refSite && (
            <TabsContent value="history">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader>
                  <CardTitle className="text-base">Journal des modifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <HistoryEntry
                      date={refSite.updatedAt}
                      action="Mise à jour du référentiel"
                      source={refSite.source ?? "interne"}
                      color="gray"
                    />
                    {refSite.blackboxInstalled && refSite.blackboxInstalledAt && (
                      <HistoryEntry
                        date={refSite.blackboxInstalledAt}
                        action={`Installation BlackBox ServSensor — ${refSite.blackboxModel ?? ""} (${refSite.blackboxSerial ?? ""})`}
                        source={refSite.blackboxInstalledBy ?? "DSI"}
                        color="green"
                      />
                    )}
                    {refSite.zabbixEnabled && refSite.zabbixLastSync && (
                      <HistoryEntry
                        date={refSite.zabbixLastSync}
                        action="Synchronisation Zabbix"
                        source="Zabbix"
                        color="blue"
                      />
                    )}
                    <HistoryEntry
                      date={refSite.createdAt}
                      action="Création de la fiche dans le référentiel DSI"
                      source="import initial"
                      color="gray"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-6 text-center">
                    L&apos;historique complet sera disponible avec une base de données persistante.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm text-gray-200 ${mono ? "font-mono text-purple-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function HistoryEntry({
  date,
  action,
  source,
  color = "gray",
}: {
  date: string;
  action: string;
  source: string;
  color?: "gray" | "blue" | "green";
}) {
  const colorCls = {
    gray:  "bg-gray-500/10 border-gray-500/20 text-gray-400",
    blue:  "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
  }[color];

  return (
    <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-gray-200">{action}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {new Date(date).toLocaleString("fr-FR")}
          </span>
          <span className={`text-[10px] border rounded-full px-2 py-0.5 ${colorCls}`}>
            {source}
          </span>
        </div>
      </div>
    </div>
  );
}
