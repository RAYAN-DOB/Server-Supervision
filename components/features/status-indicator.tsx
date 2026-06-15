"use client";

// Composant côté navigateur : il vérifie l'état de connexion du navigateur.
// À expliquer au jury : il donne une indication visuelle simple sur l'état en ligne/hors ligne et la dernière synchronisation simulée.

import { motion } from "framer-motion";
import { Wifi, WifiOff, Database } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusIndicator() {
  // isOnline garde l'état réseau du navigateur.
  // true = navigateur en ligne, false = navigateur hors ligne.
  const [isOnline, setIsOnline] = useState(true);

  // mounted évite d'afficher le composant avant que le navigateur soit prêt.
  // C'est utile avec Next.js pour éviter les différences entre rendu serveur et rendu client.
  const [mounted, setMounted] = useState(false);

  // timeSinceSync simule le temps écoulé depuis la dernière synchronisation.
  // Cette valeur sert uniquement à l'affichage dans le badge.
  const [timeSinceSync, setTimeSinceSync] = useState(0);

  useEffect(() => {
    // useEffect s'exécute côté navigateur après le chargement du composant.
    setMounted(true);
    
    const handleOnline = () => setIsOnline(true);
    // Fonction appelée quand le navigateur repasse en ligne.

    const handleOffline = () => setIsOnline(false);
    // Fonction appelée quand le navigateur passe hors ligne.

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Écoute les événements réseau du navigateur.

    const interval = setInterval(() => {
      setTimeSinceSync(prev => prev + 1);
    }, 1000);
    // Incrémente le compteur toutes les secondes.

    const syncInterval = setInterval(() => {
      setTimeSinceSync(0);
    }, 30000);
    // Remet le compteur à zéro toutes les 30 secondes pour simuler une synchronisation.

    return () => {
      // Nettoyage : on retire les écouteurs et les timers quand le composant disparaît.
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  if (!mounted) return null;
  // Tant que le composant n'est pas monté côté navigateur, on n'affiche rien.

  const content = (
    <>
      {/* Badge en ligne / hors ligne */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="shrink-0 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06]"
      >
        {isOnline ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi className="w-3.5 h-3.5 text-green-400" />
            </motion.div>
            <span className="text-xs font-medium text-green-400 whitespace-nowrap">En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400 whitespace-nowrap">Hors ligne</span>
          </>
        )}
      </motion.div>

      {/* Badge de synchronisation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="shrink-0 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06]"
        title="Temps depuis dernière synchronisation"
      >
        <Database className="w-3.5 h-3.5 text-nebula-cyan" />
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {timeSinceSync < 60 ? `${timeSinceSync}s` : `${Math.floor(timeSinceSync / 60)}m`}
          {/* Affiche les secondes puis les minutes si le compteur dépasse 60 secondes. */}
        </span>
      </motion.div>
    </>
  );

  return (
    <div className="flex items-center gap-2 shrink-0">
      {content}
    </div>
  );
}
