"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function EasterEgg() {
  const [konami, setKonami] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);

  // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newKonami = [...konami, e.key].slice(-10);
      setKonami(newKonami);

      if (newKonami.join(',') === konamiCode.join(',')) {
        setShowSecret(true);
        setKonami([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konami]);

  return (
    <AnimatePresence>
      {showSecret && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h1
              animate={{
                backgroundPosition: ['0%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-4xl font-bold bg-gradient-to-r from-nebula-violet via-nebula-magenta to-nebula-cyan bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              BRAVO RAYAN ! 🚀
            </motion.h1>
            <p className="text-xl text-gray-300 mt-4">
              Tu as trouvé le Konami Code !
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Développé avec ❤️ pour Maisons-Alfort
            </p>
            <motion.button
              onClick={() => setShowSecret(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-gradient-nebula rounded-full font-semibold shadow-neon-md pointer-events-auto"
            >
              Merci ! 😊
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
