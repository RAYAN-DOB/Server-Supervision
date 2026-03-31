"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

let globalIntensity = 0;
export function setCosmicIntensity(level: number) {
  globalIntensity = Math.max(0, Math.min(1, level));
}

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars: Array<{
      x: number; y: number; size: number; opacity: number;
      twinkleSpeed: number; baseOpacity: number; color: string;
    }> = [];

    const starColors = [
      "255,255,255", "200,200,255", "255,200,200",
      "200,255,255", "220,200,255",
    ];

    for (let i = 0; i < 300; i++) {
      const baseOp = Math.random() * 0.7 + 0.1;
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        size: Math.random() * 1.8 + 0.2,
        opacity: baseOp, baseOpacity: baseOp,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const shootingStars: Array<{
      x: number; y: number; length: number;
      speed: number; opacity: number; angle: number;
    }> = [];

    const gridLines: Array<{ pos: number; vertical: boolean; opacity: number }> = [];
    for (let i = 0; i < 8; i++) {
      gridLines.push({ pos: Math.random() * w, vertical: true, opacity: 0.02 + Math.random() * 0.02 });
      gridLines.push({ pos: Math.random() * h, vertical: false, opacity: 0.02 + Math.random() * 0.02 });
    }

    let shootingTimer = 0;
    let frame = 0;
    let animId: number;

    const animate = () => {
      frame++;
      ctx.fillStyle = "rgba(2, 1, 10, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const intensity = globalIntensity;

      // Holographic grid
      ctx.strokeStyle = `rgba(106, 0, 255, ${0.03 + intensity * 0.04})`;
      ctx.lineWidth = 0.5;
      gridLines.forEach((line) => {
        const drift = Math.sin(frame * 0.002 + line.pos * 0.01) * 2;
        ctx.globalAlpha = line.opacity + intensity * 0.02;
        ctx.beginPath();
        if (line.vertical) {
          ctx.moveTo(line.pos + drift, 0);
          ctx.lineTo(line.pos + drift, h);
        } else {
          ctx.moveTo(0, line.pos + drift);
          ctx.lineTo(w, line.pos + drift);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Stars (static, no parallax)
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > star.baseOpacity + 0.3 || star.opacity < star.baseOpacity - 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        const px = star.x;
        const py = star.y;
        const glow = star.size > 1.2;
        if (glow) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${star.color}, ${star.opacity * 0.5})`;
        }
        ctx.fillStyle = `rgba(${star.color}, ${Math.max(0, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size + intensity * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Shooting stars
      shootingTimer++;
      if (shootingTimer > 60 && Math.random() > 0.97 - intensity * 0.1) {
        const angle = Math.PI / 6 + Math.random() * Math.PI / 8;
        shootingStars.push({
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.3,
          length: 60 + Math.random() * 100,
          speed: 3 + Math.random() * 4 + intensity * 3,
          opacity: 0.8 + Math.random() * 0.2,
          angle,
        });
        shootingTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.012;
        if (s.opacity <= 0) { shootingStars.splice(i, 1); continue; }
        const tx = s.x - Math.cos(s.angle) * s.length;
        const ty = s.y - Math.sin(s.angle) * s.length;
        const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
        grad.addColorStop(0, `rgba(160, 80, 255, ${s.opacity})`);
        grad.addColorStop(0.4, `rgba(0, 200, 255, ${s.opacity * 0.5})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none" />
      <div className="fixed inset-0 -z-30 bg-gradient-to-br from-[#12062e] via-[#030014] to-[#000000]" />

      {/* Nebula orbs - mouse parallax via CSS custom properties */}
      <motion.div
        animate={{ x: [0, 80, -30, 0], y: [0, -40, 60, 0], scale: [1, 1.25, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-10 left-10 w-[450px] h-[450px] rounded-full bg-purple-600/25 blur-[100px] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 80, -30, 0], scale: [1, 1.35, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="fixed top-[40%] right-10 w-[550px] h-[550px] rounded-full bg-cyan-500/20 blur-[120px] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 50, -20, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 1.1, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="fixed bottom-10 left-[30%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/15 blur-[140px] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="fixed top-[60%] left-[60%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[100px] -z-10 pointer-events-none"
      />

      <div className="fixed inset-0 -z-10 bg-gradient-radial from-transparent via-transparent to-black/60 pointer-events-none" />
    </>
  );
}
