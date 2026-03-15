"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { AurionLogo } from "@/components/aurion-logo";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">

      {/* Orbes de lumière */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-nebula-violet/20 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-nebula-cyan/15 rounded-full blur-[160px] pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">

        {/* Badge statut */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
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
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.4 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 24px rgba(106, 0, 255, 0.4))",
                "drop-shadow(0 0 48px rgba(106, 0, 255, 0.7))",
                "drop-shadow(0 0 24px rgba(106, 0, 255, 0.4))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <AurionLogo size="xl" />
          </motion.div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="text-[88px] leading-none font-bold tracking-tighter mb-5"
        >
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="bg-gradient-to-r from-white via-purple-200 via-cyan-300 to-white bg-clip-text text-transparent"
            style={{ backgroundSize: "300% 300%" }}
          >
            AURION
          </motion.span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg text-gray-500 font-light tracking-wide mb-14 max-w-sm"
        >
          Supervision intelligente de l'infrastructure IT
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(106,0,255,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-nebula-violet to-nebula-magenta rounded-2xl font-semibold text-white text-base overflow-hidden"
            >
              {/* Shimmer */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <Activity className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Accéder au tableau de bord</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Ligne décorative */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
          className="mt-20 w-px h-16 bg-gradient-to-b from-white/20 to-transparent mx-auto"
        />
      </div>
    </div>
  );
}
