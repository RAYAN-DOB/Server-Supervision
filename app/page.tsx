"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Shield, MapPin, Building2, Zap } from "lucide-react";
import { AurionLogo } from "@/components/features/aurion-logo";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">
        {/* Badge statut */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="mb-10 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs text-gray-400 font-light tracking-wide">
            Système opérationnel · Maisons-Alfort DSI
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
          className="mb-8"
        >
          <AurionLogo size="xl" />
        </motion.div>

        {/* Titre — sobre et lisible */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl sm:text-7xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
        >
          AURION
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-lg text-gray-500 font-light tracking-wide mb-6 max-w-lg"
        >
          Supervision et référentiel des sites municipaux de Maisons-Alfort
        </motion.p>

        {/* Features pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { icon: Building2, label: "36 sites", color: "text-purple-400" },
            { icon: MapPin, label: "Carte interactive", color: "text-cyan-400" },
            { icon: Shield, label: "Supervision sécurisée", color: "text-green-400" },
            { icon: Zap, label: "Temps réel", color: "text-amber-400" },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-gray-400"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-2xl font-semibold text-white text-base transition-all shadow-lg shadow-purple-600/20"
            >
              <Activity className="w-4 h-4" />
              <span>Accéder à la plateforme</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle line */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
          className="mt-16 origin-top"
        >
          <div className="w-px h-20 mx-auto bg-gradient-to-b from-purple-500/30 via-gray-500/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
