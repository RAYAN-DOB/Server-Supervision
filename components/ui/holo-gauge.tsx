"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoloGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: "violet" | "cyan" | "green" | "amber" | "red";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  violet: { stroke: "#6A00FF", glow: "rgba(106,0,255,0.4)", bg: "rgba(106,0,255,0.08)" },
  cyan: { stroke: "#00F0FF", glow: "rgba(0,240,255,0.4)", bg: "rgba(0,240,255,0.08)" },
  green: { stroke: "#00FF78", glow: "rgba(0,255,120,0.4)", bg: "rgba(0,255,120,0.08)" },
  amber: { stroke: "#FFA500", glow: "rgba(255,165,0,0.4)", bg: "rgba(255,165,0,0.08)" },
  red: { stroke: "#FF3300", glow: "rgba(255,51,0,0.4)", bg: "rgba(255,51,0,0.08)" },
};

const sizeMap = {
  sm: { svg: 80, stroke: 6, text: "text-lg", label: "text-[10px]" },
  md: { svg: 120, stroke: 8, text: "text-2xl", label: "text-xs" },
  lg: { svg: 160, stroke: 10, text: "text-3xl", label: "text-sm" },
};

export function HoloGauge({ value, max, label, unit = "", color = "cyan", size = "md" }: HoloGaugeProps) {
  const c = colorMap[color];
  const s = sizeMap[size];
  const pct = Math.min(value / max, 1);
  const r = (s.svg - s.stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const center = s.svg / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s.svg, height: s.svg }}>
        <svg width={s.svg} height={s.svg} className="-rotate-90">
          {/* bg ring */}
          <circle cx={center} cy={center} r={r} fill="none" stroke={c.bg} strokeWidth={s.stroke} />
          {/* value arc */}
          <motion.circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={c.stroke}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${c.glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-white", s.text)}>
            {typeof value === "number" ? value.toFixed(value % 1 !== 0 ? 1 : 0) : value}
          </span>
          {unit && <span className="text-[10px] text-gray-500 -mt-0.5">{unit}</span>}
        </div>
      </div>
      <span className={cn("text-gray-400 font-light", s.label)}>{label}</span>
    </div>
  );
}
