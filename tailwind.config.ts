import type { Config } from "tailwindcss";

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
        // Nebula Color System
        nebula: {
          violet: "#6A00FF",
          magenta: "#C300FF",
          cyan: "#00F0FF",
          pink: "#FF00E5",
          space: "#050510",
          dark: "#0A0A1A",
          darker: "#02010A",
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
        "gradient-nebula": "linear-gradient(135deg, #6A00FF 0%, #C300FF 50%, #FF00E5 100%)",
        "gradient-cyber": "linear-gradient(135deg, #6A00FF 0%, #00F0FF 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "neon-sm": "0 0 10px -2px rgba(106, 0, 255, 0.3)",
        "neon-md": "0 0 20px -5px rgba(106, 0, 255, 0.4)",
        "neon-lg": "0 0 30px -5px rgba(106, 0, 255, 0.5)",
        "neon-xl": "0 0 40px -10px rgba(106, 0, 255, 0.6)",
        "cyan-neon": "0 0 20px -5px rgba(0, 240, 255, 0.5)",
        "magenta-neon": "0 0 20px -5px rgba(195, 0, 255, 0.5)",
      },
      dropShadow: {
        "neon": "0 0 12px rgba(106, 0, 255, 0.7)",
        "cyan-neon": "0 0 12px rgba(0, 240, 255, 0.7)",
        "magenta-neon": "0 0 12px rgba(195, 0, 255, 0.7)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.5s ease-in",
        "spin-slow": "spin 8s linear infinite",
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
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
