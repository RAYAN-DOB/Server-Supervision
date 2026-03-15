"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoloCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "violet" | "cyan" | "magenta" | "amber" | "red" | "green";
  intensity?: "subtle" | "medium" | "high";
  noBorder?: boolean;
}

const glowMap = {
  violet: "rgba(106, 0, 255, 0.4)",
  cyan: "rgba(0, 240, 255, 0.4)",
  magenta: "rgba(195, 0, 255, 0.4)",
  amber: "rgba(255, 165, 0, 0.4)",
  red: "rgba(255, 50, 0, 0.4)",
  green: "rgba(0, 255, 120, 0.4)",
};

const borderGlowMap = {
  violet: "rgba(106, 0, 255, 0.25)",
  cyan: "rgba(0, 240, 255, 0.25)",
  magenta: "rgba(195, 0, 255, 0.25)",
  amber: "rgba(255, 165, 0, 0.25)",
  red: "rgba(255, 50, 0, 0.25)",
  green: "rgba(0, 255, 120, 0.25)",
};

export function HoloCard({
  children,
  className,
  glowColor = "violet",
  intensity = "medium",
  noBorder,
}: HoloCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const maxTilt = intensity === "high" ? 8 : intensity === "medium" ? 5 : 3;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -maxTilt, y: x * maxTilt });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        boxShadow: isHovered
          ? `0 20px 60px -15px ${glowMap[glowColor]}, 0 0 30px -10px ${borderGlowMap[glowColor]}`
          : "0 4px 20px -5px rgba(0,0,0,0.3)",
      }}
      className={cn(
        "relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden",
        !noBorder && "border border-white/[0.06]",
        isHovered && !noBorder && "border-white/[0.15]",
        "transition-[border-color] duration-300",
        className
      )}
    >
      {/* Holographic sheen */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${(tilt.y / maxTilt + 0.5) * 100}% ${(tilt.x / -maxTilt + 0.5) * 100}%, ${borderGlowMap[glowColor]} 0%, transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}
