"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Shield, MapPin, Building2, Sparkles, Zap } from "lucide-react";
import { AurionLogo } from "@/components/aurion-logo";

const letterVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 0.7 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomePage() {
  const title = "AURION";

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(106,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(106,0,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hexagonal pattern subtle */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.02] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">
        {/* Badge statut */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="mb-10 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm holo-border"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs text-gray-400 font-light tracking-wide">
            Système opérationnel · Maisons-Alfort DSI
          </span>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 24px rgba(106, 0, 255, 0.4))",
                "drop-shadow(0 0 60px rgba(106, 0, 255, 0.8))",
                "drop-shadow(0 0 24px rgba(106, 0, 255, 0.4))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <AurionLogo size="xl" />
          </motion.div>
        </motion.div>

        {/* Titre — letter by letter */}
        <div className="text-7xl sm:text-[96px] leading-none font-bold tracking-tighter mb-5 flex overflow-hidden"
          style={{ perspective: "800px" }}
        >
          {title.split("").map((ch, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block neon-text"
            >
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="bg-gradient-to-r from-white via-purple-300 via-cyan-300 to-white bg-clip-text text-transparent"
                style={{ backgroundSize: "300% 300%" }}
              >
                {ch}
              </motion.span>
            </motion.span>
          ))}
        </div>

        {/* Subtitle with typewriter effect */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ delay: 1.3, duration: 1 }}
          className="overflow-hidden mb-2"
        >
          <p className="text-sm font-mono text-purple-400/60 tracking-widest uppercase">
            Nebula OS v2.0
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg text-gray-500 font-light tracking-wide mb-6 max-w-lg"
        >
          Supervision next-gen et référentiel des sites municipaux de Maisons-Alfort
        </motion.p>

        {/* Features — holo cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
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
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="holo-card flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-gray-400 cursor-default"
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
          transition={{ delay: 1.5, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 80px rgba(106,0,255,0.6)" }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl font-semibold text-white text-base overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
              />
              <Activity className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Accéder au Command Center</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-200" />
            </motion.button>
          </Link>
          <Link href="/sites">
            <motion.button
              whileHover={{ scale: 1.04, borderColor: "rgba(106, 0, 255, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="holo-card flex items-center gap-3 px-8 py-4 border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl font-medium text-gray-300 text-base transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Voir le référentiel</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Animated line */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 1.2, ease: "easeOut" }}
          className="mt-16 origin-top"
        >
          <div className="w-px h-20 mx-auto bg-gradient-to-b from-purple-500/40 via-cyan-500/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
