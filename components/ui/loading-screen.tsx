"use client";

import { motion } from "framer-motion";
import { GradientBackground } from "@/components/ui/gradient-background";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <GradientBackground />
      
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl bg-gradient-nebula opacity-20 blur-xl"
          />
          <div className="relative w-full h-full rounded-2xl bg-gradient-nebula shadow-neon-xl flex items-center justify-center">
            <span className="text-4xl font-bold">A</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold gradient-text mb-4"
        >
          AURION
        </motion.h1>

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-nebula-violet"
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-gray-400"
        >
          Chargement du système de supervision...
        </motion.p>
      </div>
    </div>
  );
}
