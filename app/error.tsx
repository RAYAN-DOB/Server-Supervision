"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("[AURION] Global error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-[#020208]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-red-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 14 }}
          className="mb-8 w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
        >
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Erreur inattendue
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 font-light text-sm mb-6 max-w-sm leading-relaxed"
        >
          Une erreur s&apos;est produite dans le système de supervision AURION.
          L&apos;incident a été journalisé automatiquement.
        </motion.p>

        {/* Error details */}
        {error.message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 w-full p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Détails de l&apos;erreur</span>
              {error.digest && (
                <span className="ml-auto text-xs text-gray-600 font-mono">
                  #{error.digest.slice(0, 8)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono break-all leading-relaxed">
              {error.message}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl font-semibold text-white text-sm transition-all shadow-lg shadow-purple-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </motion.button>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] rounded-xl font-medium text-gray-300 text-sm transition-all"
            >
              <Home className="w-4 h-4" />
              Tableau de bord
            </motion.button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-xs text-gray-700 font-mono"
        >
          AURION · DSI Maisons-Alfort
        </motion.p>
      </div>
    </div>
  );
}
