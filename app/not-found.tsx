"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Search, Terminal } from "lucide-react";
import { AurionLogo } from "@/components/aurion-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-red-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="mb-8"
        >
          <AurionLogo size="lg" />
        </motion.div>

        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <span className="text-[120px] font-bold leading-none select-none bg-gradient-to-b from-purple-400/60 to-purple-800/20 bg-clip-text text-transparent tracking-tighter">
            404
          </span>
        </motion.div>

        {/* Terminal-style message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm"
        >
          <Terminal className="w-4 h-4 text-red-400" />
          <code className="text-sm text-red-300 font-mono">
            ERROR: route non trouvée — code 0x404
          </code>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Page introuvable
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-gray-500 font-light text-sm mb-10 max-w-sm"
        >
          La ressource demandée n&apos;existe pas ou a été déplacée dans
          le système de supervision AURION.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl font-semibold text-white text-sm transition-all shadow-lg shadow-purple-600/20"
            >
              <Home className="w-4 h-4" />
              Tableau de bord
            </motion.button>
          </Link>
          <Link href="javascript:history.back()">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] rounded-xl font-medium text-gray-300 text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </motion.button>
          </Link>
          <Link href="/sites">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] rounded-xl font-medium text-gray-300 text-sm transition-all"
            >
              <Search className="w-4 h-4" />
              Référentiel
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 text-xs text-gray-700 font-mono"
        >
          AURION · DSI Maisons-Alfort · Système opérationnel
        </motion.p>
      </div>
    </div>
  );
}
