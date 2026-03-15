"use client";

import { motion } from "framer-motion";

interface CosmicLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function CosmicLoader({ size = "md", text }: CosmicLoaderProps) {
  const s = size === "sm" ? 32 : size === "md" ? 56 : 80;
  const ringWidth = size === "sm" ? 2 : size === "md" ? 3 : 4;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: s, height: s }}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${ringWidth}px solid transparent`,
            borderTopColor: "#6A00FF",
            borderRightColor: "rgba(106, 0, 255, 0.3)",
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{
            inset: ringWidth + 3,
            border: `${ringWidth}px solid transparent`,
            borderTopColor: "#00F0FF",
            borderLeftColor: "rgba(0, 240, 255, 0.3)",
          }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{
            inset: (ringWidth + 3) * 2,
            border: `${ringWidth - 1}px solid transparent`,
            borderBottomColor: "#C300FF",
          }}
        />
        {/* Core glow */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full bg-gradient-to-br from-nebula-violet to-nebula-cyan"
          style={{
            inset: s * 0.35,
            filter: `blur(${size === "sm" ? 2 : 4}px)`,
          }}
        />
      </div>
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm text-gray-400 font-light"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
