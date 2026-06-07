"use client";

import { motion } from "framer-motion";

interface AurionLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export function AurionLogo({ size = "md", animated = true }: AurionLogoProps) {
  const sizes = {
    sm: { container: 32, fontSize: 16 },
    md: { container: 40, fontSize: 20 },
    lg: { container: 56, fontSize: 28 },
    xl: { container: 80, fontSize: 40 },
  };

  const { container, fontSize } = sizes[size];

  return (
    <motion.div
      whileHover={animated ? { scale: 1.02 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      className="relative inline-flex items-center justify-center"
      style={{ width: container, height: container }}
    >
      {/* Subtle status halo */}
      <motion.div
        animate={animated ? {
          scale: [1, 1.04, 1],
          opacity: [0.18, 0.28, 0.18],
        } : {}}
        transition={animated ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        } : {}}
        className="absolute inset-0 rounded-2xl bg-cyan-400 blur-lg opacity-20"
      />

      {/* Main Logo Container */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-700 shadow-[0_14px_34px_-26px_rgba(34,211,238,0.6)]">
        {/* Letter A */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center font-bold text-white"
          style={{ fontSize }}
        >
          <span>A</span>
        </div>
      </div>

      {/* Status Dot */}
      {animated && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950"
        />
      )}
    </motion.div>
  );
}

export function AurionLogoFull({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AurionLogo size="lg" />
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-slate-50"
        >
          AURION
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-slate-400"
        >
          Système de supervision
        </motion.p>
      </div>
    </div>
  );
}
