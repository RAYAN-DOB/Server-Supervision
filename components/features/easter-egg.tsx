"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EasterEggMode = "none" | "konami" | "matrix" | "nebula";

export function EasterEgg() {
  const [keys, setKeys] = useState<string[]>([]);
  const [mode, setMode] = useState<EasterEggMode>("none");
  const [matrixActive, setMatrixActive] = useState(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixAnimRef = useRef<number>(0);

  const konamiCode = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const matrixWord = "matrix";
  const nebulaWord = "nebula";

  const handleKey = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => {
      const updated = [...prev, e.key].slice(-10);

      if (updated.join(",") === konamiCode.join(",")) {
        setMode("konami");
        return [];
      }

      const typed = updated.join("").toLowerCase();
      if (typed.endsWith(matrixWord)) {
        setMatrixActive((m) => !m);
        setMode((m) => (m === "matrix" ? "none" : "matrix"));
        return [];
      }
      if (typed.endsWith(nebulaWord)) {
        setMode("nebula");
        setTimeout(() => setMode("none"), 6000);
        return [];
      }

      return updated;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Matrix rain effect
  useEffect(() => {
    if (!matrixActive) {
      cancelAnimationFrame(matrixAnimRef.current);
      return;
    }
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 14);
    const drops = new Array(cols).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "13px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        ctx.fillStyle = brightness > 0.95 ? "#fff" : brightness > 0.8 ? "#5f5" : "#0a0";
        ctx.fillText(char, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixAnimRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(matrixAnimRef.current);
  }, [matrixActive]);

  return (
    <>
      {/* Matrix Canvas */}
      {matrixActive && (
        <canvas
          ref={matrixCanvasRef}
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{ mixBlendMode: "screen", opacity: 0.3 }}
        />
      )}

      {/* Nebula Max Mode */}
      <AnimatePresence>
        {mode === "nebula" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.8, 0],
                  y: [null, (Math.random() - 0.5) * 200],
                }}
                transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 2 }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${
                    ["#6A00FF", "#00F0FF", "#C300FF", "#FF00E5"][i % 4]
                  } 0%, transparent 70%)`,
                  filter: "blur(2px)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konami Code */}
      <AnimatePresence>
        {mode === "konami" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setMode("none")}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🚀
              </motion.div>
              <motion.h1
                animate={{ backgroundPosition: ["0%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-5xl font-bold bg-gradient-to-r from-nebula-violet via-nebula-cyan to-nebula-magenta bg-clip-text text-transparent neon-text"
                style={{ backgroundSize: "200% auto" }}
              >
                NEBULA OS ACTIVÉ
              </motion.h1>
              <p className="text-xl text-gray-300 mt-4 font-light">
                Mode légendaire débloqué !
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
                  Tapez &quot;matrix&quot; → Mode Matrix
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm">
                  Tapez &quot;nebula&quot; → Explosion cosmique
                </div>
              </div>
              <motion.button
                onClick={() => setMode("none")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 px-8 py-3 bg-gradient-nebula rounded-full font-semibold shadow-neon-md"
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matrix indicator */}
      <AnimatePresence>
        {matrixActive && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[101] px-4 py-2 rounded-full bg-green-900/80 border border-green-500/40 text-green-400 text-xs font-mono"
          >
            MATRIX MODE — tapez &quot;matrix&quot; pour désactiver
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
