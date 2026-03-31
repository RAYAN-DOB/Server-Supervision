"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show on Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShow(!show);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // FPS Counter
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(rafId);
    };
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-50 glass-card p-3 rounded-xl border border-white/20"
    >
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-nebula-cyan" />
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">FPS:</span>
            <span className={`font-mono font-bold ${fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              {fps}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-1 text-[10px] text-gray-500">
        Ctrl+Shift+P pour masquer
      </div>
    </motion.div>
  );
}
