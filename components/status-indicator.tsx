"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, Database } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [timeSinceSync, setTimeSinceSync] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update timer every second
    const interval = setInterval(() => {
      setTimeSinceSync(prev => prev + 1);
    }, 1000);

    // Reset timer every 30 seconds
    const syncInterval = setInterval(() => {
      setTimeSinceSync(0);
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Online Status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="glass-card px-3 py-2 rounded-full flex items-center gap-2"
      >
        {isOnline ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi className="w-4 h-4 text-green-400" />
            </motion.div>
            <span className="text-xs font-medium text-green-400">En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-red-400">Hors ligne</span>
          </>
        )}
      </motion.div>

      {/* Sync Status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card px-3 py-2 rounded-full flex items-center gap-2"
        title="Temps depuis dernière synchronisation"
      >
        <Database className="w-4 h-4 text-nebula-cyan" />
        <span className="text-xs text-gray-400">
          {timeSinceSync < 60 ? `${timeSinceSync}s` : `${Math.floor(timeSinceSync / 60)}m`}
        </span>
      </motion.div>
    </div>
  );
}
