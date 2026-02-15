"use client";

import { useEffect, useRef } from "react";

export function AnimatedDatacenterBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particles representing data packets
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: ["#6A00FF", "#C300FF", "#00F0FF"][Math.floor(Math.random() * 3)],
      });
    }

    // Grid nodes
    const gridNodes: Array<{ x: number; y: number; pulse: number }> = [];
    const gridSpacing = 150;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        gridNodes.push({
          x,
          y,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(5, 5, 16, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = "rgba(106, 0, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update grid nodes
      gridNodes.forEach((node) => {
        node.pulse += 0.02;
        const pulseSize = Math.sin(node.pulse) * 2 + 3;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize);
        gradient.addColorStop(0, `rgba(106, 0, 255, ${Math.sin(node.pulse) * 0.3 + 0.2})`);
        gradient.addColorStop(1, "rgba(106, 0, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between close nodes
      ctx.strokeStyle = "rgba(106, 0, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < gridNodes.length; i++) {
        for (let j = i + 1; j < gridNodes.length; j++) {
          const dx = gridNodes[i].x - gridNodes[j].x;
          const dy = gridNodes[i].y - gridNodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < gridSpacing * 1.5) {
            const opacity = (1 - distance / (gridSpacing * 1.5)) * 0.15;
            ctx.strokeStyle = `rgba(195, 0, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(gridNodes[i].x, gridNodes[i].y);
            ctx.lineTo(gridNodes[j].x, gridNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        gradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, particle.color + "00");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3;
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 50%, #0a0a14 100%)" }}
    />
  );
}
