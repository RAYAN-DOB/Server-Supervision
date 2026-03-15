"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Stars
    const stars: Array<{ x: number; y: number; size: number; opacity: number; twinkleSpeed: number }> = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // Shooting stars
    const shootingStars: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = [];

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 3 + 2,
        opacity: 1,
      });
    };

    // Create shooting star randomly
    setInterval(() => {
      if (Math.random() > 0.97) createShootingStar();
    }, 100);

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(3, 0, 20, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw shooting stars
      shootingStars.forEach((star, index) => {
        star.x += star.speed;
        star.y += star.speed * 0.5;
        star.opacity -= 0.01;

        if (star.opacity <= 0) {
          shootingStars.splice(index, 1);
          return;
        }

        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - star.length,
          star.y - star.length * 0.5
        );
        gradient.addColorStop(0, `rgba(138, 43, 226, ${star.opacity})`);
        gradient.addColorStop(1, "rgba(138, 43, 226, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* Animated Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-20 pointer-events-none"
      />

      {/* Cosmic Gradient Base */}
      <div className="fixed inset-0 -z-30 bg-gradient-to-br from-[#1A0B2E] via-[#030014] to-[#000000]" />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-20 left-20 w-96 h-96 rounded-full bg-purple-600/20 blur-[100px] -z-10 pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="fixed top-1/2 right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px] -z-10 pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -80, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="fixed bottom-20 left-1/3 w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[130px] -z-10 pointer-events-none"
      />

      {/* Vignette */}
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-transparent via-transparent to-black/60 pointer-events-none" />
    </>
  );
}
