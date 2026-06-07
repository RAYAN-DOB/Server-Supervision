import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // AURION operations palette: sober DSI dashboard, not marketing/neon.
        nebula: {
          violet: "#2563EB",
          magenta: "#0EA5E9",
          cyan: "#22D3EE",
          pink: "#38BDF8",
          space: "#07111F",
          dark: "#0B1220",
          darker: "#020617",
        },
        primary: {
          50: "#f5f0ff",
          100: "#ede5ff",
          200: "#ddd0ff",
          300: "#c3a8ff",
          400: "#a375ff",
          500: "#8540ff",
          600: "#6A00FF",
          700: "#5f00e6",
          800: "#4f00c2",
          900: "#42009e",
          950: "#280066",
        },
      },
      backgroundImage: {
        "gradient-nebula": "linear-gradient(135deg, #0F172A 0%, #0E7490 54%, #0369A1 100%)",
        "gradient-cyber": "linear-gradient(135deg, #0F172A 0%, #0891B2 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "neon-sm": "0 8px 24px -18px rgba(34, 211, 238, 0.45)",
        "neon-md": "0 12px 32px -22px rgba(34, 211, 238, 0.45)",
        "neon-lg": "0 18px 42px -28px rgba(34, 211, 238, 0.42)",
        "neon-xl": "0 24px 56px -34px rgba(34, 211, 238, 0.38)",
        "cyan-neon": "0 14px 34px -24px rgba(34, 211, 238, 0.45)",
        "magenta-neon": "0 14px 34px -24px rgba(14, 165, 233, 0.35)",
      },
      dropShadow: {
        "neon": "0 4px 14px rgba(34, 211, 238, 0.25)",
        "cyan-neon": "0 4px 14px rgba(34, 211, 238, 0.32)",
        "magenta-neon": "0 4px 14px rgba(14, 165, 233, 0.24)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.5s ease-in",
        "spin-slow": "spin 8s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "border-flow": "borderFlow 4s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(106, 0, 255, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(106, 0, 255, 0.8)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
};

export default config;
