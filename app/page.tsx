"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { AurionLogo } from "@/components/aurion-logo";
import { FloatingCounter } from "@/components/floating-counter";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [stats, setStats] = useState({ sites: 0, bays: 0, alerts: 0, uptime: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setStats({ sites: 12, bays: 47, alerts: 3, uptime: 99 }), 500);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 text-center">
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              duration: 1.5,
              delay: 0.2,
            }}
            className="flex justify-center mb-12"
          >
            <motion.div
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(138, 43, 226, 0.5))",
                  "drop-shadow(0 0 40px rgba(138, 43, 226, 0.8))",
                  "drop-shadow(0 0 20px rgba(138, 43, 226, 0.5))",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <AurionLogo size="xl" />
            </motion.div>
          </motion.div>

          {/* Title with Shimmer */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="bg-gradient-to-r from-white via-purple-200 via-cyan-200 via-yellow-200 to-white bg-clip-text text-transparent"
              style={{ backgroundSize: "300% 300%" }}
            >
              AURION
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mb-6"
          >
            <p className="text-2xl text-gray-400 font-light mb-2">
              Système de Supervision Intelligente
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Maisons-Alfort • Infrastructure IT</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </motion.div>

          {/* Floating Counters */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 max-w-4xl mx-auto px-4"
            >
              <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group">
                <FloatingCounter value={stats.sites} label="Sites" />
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                />
              </div>

              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all group">
                <FloatingCounter value={stats.bays} label="Baies Réseau" />
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.7, duration: 1 }}
                />
              </div>

              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.04] hover:border-red-500/30 transition-all group">
                <FloatingCounter value={stats.alerts} label="Alertes" />
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.9, duration: 1 }}
                />
              </div>

              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.04] hover:border-green-500/30 transition-all group">
                <FloatingCounter value={stats.uptime} label="Uptime" suffix="%" />
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.1, duration: 1 }}
                />
              </div>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(138, 43, 226, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-2xl font-semibold text-white text-lg overflow-hidden"
              >
                <motion.div
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="relative z-10 flex items-center gap-2">
                  Accéder au Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>
            </Link>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all font-medium text-white text-lg backdrop-blur-xl flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Connexion Sécurisée
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Technologie de Pointe
              </span>
            </motion.h2>
            <p className="text-xl text-gray-500 font-light">
              Une plateforme qui redéfinit la supervision IT
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Zap,
                title: "IA Prédictive",
                description: "Analyse intelligente et prévisions basées sur vos données",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Sécurité Avancée",
                description: "Authentification multi-niveaux et audit complet",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Sparkles,
                title: "Interface Futuriste",
                description: "Design next-gen avec animations cinématiques",
                gradient: "from-cyan-500 to-blue-500",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl overflow-hidden group"
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
