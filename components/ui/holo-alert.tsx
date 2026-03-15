"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Bell, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoloAlertProps {
  severity: "critical" | "major" | "minor" | "info";
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
}

const config = {
  critical: {
    icon: AlertTriangle,
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    glow: "shadow-[0_0_30px_rgba(255,51,0,0.2)]",
    iconColor: "text-red-400",
    bar: "bg-red-500",
  },
  major: {
    icon: AlertCircle,
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    glow: "shadow-[0_0_20px_rgba(255,165,0,0.15)]",
    iconColor: "text-orange-400",
    bar: "bg-orange-500",
  },
  minor: {
    icon: Bell,
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    glow: "",
    iconColor: "text-yellow-400",
    bar: "bg-yellow-500",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    glow: "",
    iconColor: "text-blue-400",
    bar: "bg-blue-500",
  },
};

export function HoloAlert({ severity, title, message, visible, onClose }: HoloAlertProps) {
  const c = config[severity];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0, scale: 0.9, rotateY: 30 }}
          animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ x: 300, opacity: 0, scale: 0.9, rotateY: -30 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className={cn(
            "relative overflow-hidden rounded-xl border backdrop-blur-xl p-4 max-w-sm",
            c.border, c.bg, c.glow,
            severity === "critical" && "alert-glow-critical"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", c.bar)} />
          <div className="flex items-start gap-3 pl-2">
            <div className={cn("mt-0.5 flex-shrink-0", c.iconColor)}>
              <Icon className="w-5 h-5 gauge-glow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
