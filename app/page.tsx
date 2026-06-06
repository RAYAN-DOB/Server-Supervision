"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Shield, MapPin, Building2, Zap } from "lucide-react";
import { AurionLogo } from "@/components/features/aurion-logo";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="relative z-10 flex select-none flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="mb-10 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="text-xs font-light tracking-wide text-gray-400">
            Systeme operationnel - Maisons-Alfort DSI
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
          className="mb-8"
        >
          <AurionLogo size="xl" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl"
        >
          AURION
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mb-6 max-w-lg text-lg font-light tracking-wide text-gray-500"
        >
          Supervision environnementale des salles serveurs municipales
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Building2, label: "HTDV / PLDS", color: "text-purple-400" },
            { icon: MapPin, label: "Sites supervises", color: "text-cyan-400" },
            { icon: Shield, label: "Supervision securisee", color: "text-green-400" },
            { icon: Zap, label: "Temps reel", color: "text-amber-400" },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-gray-400"
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-600/20 transition-all hover:from-purple-500 hover:to-purple-600"
            >
              <Activity className="h-4 w-4" />
              <span>Acceder a la plateforme</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
          className="mt-16 origin-top"
        >
          <div className="mx-auto h-20 w-px bg-gradient-to-b from-purple-500/30 via-gray-500/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
