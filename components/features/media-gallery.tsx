"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  FileText,
  Image as ImageIcon,
  Camera,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteMedia } from "@/types";

// ─── Utilitaires ─────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  PHOTO_LOCAL: "Vue locale",
  PHOTO_BAY: "Vue baie",
  ZOOM_EQUIPMENT: "Équipement",
  PLAN_PDF: "Document",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  PHOTO_LOCAL: Camera,
  PHOTO_BAY: ImageIcon,
  ZOOM_EQUIPMENT: ZoomIn,
  PLAN_PDF: FileText,
};

function ConfidenceBadge({ confidence }: { confidence: number | null }) {
  if (confidence == null) return null;
  const label =
    confidence >= 0.9 ? "Visible" : confidence >= 0.7 ? "Probable" : "À confirmer";
  const cls =
    confidence >= 0.9
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : confidence >= 0.7
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cls)}>
      {label} {Math.round(confidence * 100)}%
    </span>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  items: SiteMedia[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % items.length),
    [items.length]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  const current = items[index];
  const TypeIcon = TYPE_ICONS[current.type] ?? ImageIcon;
  const isPdf = current.type === "PLAN_PDF";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenu */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur border border-white/10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white font-medium">
              {TYPE_LABELS[current.type] ?? current.type}
            </span>
            {current.local && (
              <span className="text-xs text-gray-500">· {current.local.name}</span>
            )}
            {current.bay && (
              <span className="text-xs text-gray-500">· {current.bay.name}</span>
            )}
            <ConfidenceBadge confidence={current.confidence} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {index + 1} / {items.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image / PDF */}
        <div className="relative flex-1 bg-black/40 border-x border-white/10 overflow-hidden flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <FileText className="w-20 h-20 text-purple-400" />
              <p className="text-gray-300 text-sm">Document PDF</p>
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-lg text-sm hover:bg-purple-600/50 transition-colors"
              >
                Ouvrir le document
              </a>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={TYPE_LABELS[current.type] ?? "Photo"}
              className="max-h-[60vh] max-w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/placeholder-image.svg";
              }}
            />
          )}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip */}
        {items.length > 1 && (
          <div className="flex gap-1.5 px-3 py-3 bg-black/60 backdrop-blur border border-white/10 rounded-b-xl overflow-x-auto">
            {items.map((item, i) => {
              const Icon = TYPE_ICONS[item.type] ?? ImageIcon;
              return (
                <button
                  key={item.id}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all",
                    i === index
                      ? "border-purple-500 opacity-100"
                      : "border-white/10 opacity-50 hover:opacity-80"
                  )}
                >
                  {item.type === "PLAN_PDF" ? (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-white/5"><svg class="w-4 h-4 text-gray-500" ...></svg></div>`;
                        }
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface MediaGalleryProps {
  siteId: string;
  media: SiteMedia[];
  loading: boolean;
  error: string | null;
}

export function MediaGallery({ media, loading, error }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all" ? media : media.filter((m) => m.type === activeFilter);

  const typeFilters = [
    { key: "all", label: "Tout" },
    { key: "PHOTO_LOCAL", label: "Locaux" },
    { key: "PHOTO_BAY", label: "Baies" },
    { key: "ZOOM_EQUIPMENT", label: "Équipements" },
    { key: "PLAN_PDF", label: "Documents" },
  ].filter(
    (f) => f.key === "all" || media.some((m) => m.type === f.key)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-2" />
        <span className="text-gray-400 text-sm">Chargement de la galerie...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-red-400">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-600">
        <Camera className="w-10 h-10" />
        <p className="text-sm">Aucun média disponible pour ce site.</p>
        <p className="text-xs text-gray-700">
          Exécutez <code className="bg-white/5 px-1 rounded">scripts/generate-mapping.ts</code>{" "}
          puis <code className="bg-white/5 px-1 rounded">prisma/seed-inventory.ts</code> pour importer les photos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((f) => {
          const count = f.key === "all" ? media.length : media.filter((m) => m.type === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                activeFilter === f.key
                  ? "bg-purple-600/30 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {f.label}
              <span className="ml-1.5 text-[11px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => {
            const TypeIcon = TYPE_ICONS[item.type] ?? ImageIcon;
            const isPdf = item.type === "PLAN_PDF";
            const lightboxIdx = media.indexOf(item);
            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setLightboxIndex(lightboxIdx)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
              >
                {isPdf ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <span className="text-[10px] text-gray-500 px-2 text-center truncate max-w-full">
                      {item.url.split("/").pop()}
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={TYPE_LABELS[item.type] ?? "Photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className = "w-full h-full flex flex-col items-center justify-center gap-2 bg-white/[0.02]";
                        placeholder.innerHTML = `<svg class="w-8 h-8 text-gray-600" ...></svg>`;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <div className="flex items-center gap-1">
                      <TypeIcon className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-[10px] text-white/70">
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                    </div>
                    <ConfidenceBadge confidence={item.confidence} />
                  </div>
                </div>

                {/* Local/Bay label */}
                {(item.local || item.bay) && (
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] bg-black/60 text-gray-300 px-1.5 py-0.5 rounded">
                      {item.local?.name ?? item.bay?.name}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={media}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
