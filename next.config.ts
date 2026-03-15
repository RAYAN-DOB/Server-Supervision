import type { NextConfig } from "next";

// Avertissement si AUTH_SECRET manquant (erreur runtime dans lib/auth/jwt.ts en prod)
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
) {
  console.warn(
    "[AURION] ⚠ AUTH_SECRET non défini ou trop court (min. 32 caractères). " +
      "Définissez cette variable dans les paramètres Netlify."
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tremor/react"],
  },
  images: {
    // Restreindre aux domaines réellement utilisés (OpenStreetMap pour Leaflet)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tile.openstreetmap.org",
      },
      {
        protocol: "https",
        hostname: "*.tile.openstreetmap.org",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Headers de sécurité supplémentaires (complément à netlify.toml)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
