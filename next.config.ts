import type { NextConfig } from "next";

// Avertissement si AUTH_SECRET est absent ou trop court en production.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
) {
  console.warn(
    "[AURION] AUTH_SECRET non defini ou trop court (min. 32 caracteres). " +
      "Definissez cette variable dans les parametres Vercel."
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tremor/react"],
  },
  images: {
    // Restreindre aux domaines reellement utilises.
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
  // Headers de securite supplementaires pour les routes API.
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
