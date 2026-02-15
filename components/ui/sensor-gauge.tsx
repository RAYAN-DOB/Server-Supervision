"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SiteStatus } from "@/types";

interface SensorGaugeProps {
  value: number;
  maxValue: number;
  unit: string;
  label: string;
  status: SiteStatus;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function SensorGauge({
  value,
  maxValue,
  unit,
  label,
  status,
  size = "md",
  showValue = true,
}: SensorGaugeProps) {
  const percentage = (value / maxValue) * 100;
  
  const sizes = {
    sm: { container: "w-24 h-24", stroke: 6, text: "text-sm" },
    md: { container: "w-32 h-32", stroke: 8, text: "text-base" },
    lg: { container: "w-40 h-40", stroke: 10, text: "text-lg" },
  };
  
  const colors = {
    ok: "#10b981",
    warning: "#f59e0b",
    critical: "#ef4444",
    maintenance: "#3b82f6",
  };
  
  const color = colors[status];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("relative", sizes[size].container)}>
        {/* Background circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={sizes[size].stroke}
            fill="none"
          />
          
          {/* Animated progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={sizes[size].stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        
        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("font-bold", sizes[size].text)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ color }}
            >
              {value.toFixed(1)}
            </motion.span>
            <span className="text-xs text-gray-400">{unit}</span>
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
      </div>
    </div>
  );
}
