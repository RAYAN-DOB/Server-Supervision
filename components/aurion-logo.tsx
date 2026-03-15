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
      whileHover={animated ? { scale: 1.05, rotate: 5 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      className="relative inline-flex items-center justify-center"
      style={{ width: container, height: container }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        animate={animated ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={animated ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        } : {}}
        className="absolute inset-0 rounded-2xl bg-gradient-nebula blur-lg opacity-40"
      />

      {/* Main Logo Container */}
      <div className="relative rounded-2xl bg-gradient-to-br from-nebula-violet via-nebula-magenta to-nebula-cyan shadow-neon-lg overflow-hidden">
        {/* Animated Background Pattern */}
        <motion.div
          animate={animated ? {
            backgroundPosition: ['0% 0%', '100% 100%'],
          } : {}}
          transition={animated ? {
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          } : {}}
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Letter A */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center font-bold text-white"
          style={{ fontSize }}
        >
          <motion.span
            animate={animated ? {
              textShadow: [
                '0 0 10px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.8)',
                '0 0 10px rgba(255,255,255,0.5)',
              ],
            } : {}}
            transition={animated ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            } : {}}
          >
            A
          </motion.span>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-white/20 rounded-full" />
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
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-nebula-space"
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
          className="text-2xl font-bold bg-gradient-to-r from-nebula-violet via-nebula-magenta to-nebula-cyan bg-clip-text text-transparent"
        >
          AURION
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-400"
        >
          Système de Supervision
        </motion.p>
      </div>
    </div>
  );
}
