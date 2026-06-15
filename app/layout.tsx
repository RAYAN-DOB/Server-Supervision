// ============================================================================
// app/layout.tsx — Layout racine de l'application AURION (Next.js App Router)
// ----------------------------------------------------------------------------
// Rôle : c'est le squelette HTML commun à TOUTES les pages d'AURION (la balise
// <html> et <body>). Il charge les polices, les métadonnées SEO/PWA, le thème
// sombre, et enveloppe chaque page dans les "Providers" (contexte global :
// React Query, store, etc.).
// Reçoit : `children` = la page courante affichée par Next.js.
// Produit : le document HTML final envoyé au navigateur.
// ============================================================================

import type { Metadata } from "next";
// Polices Google chargées par Next.js (optimisées, auto-hébergées)
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
// Providers = contexte global injecté autour de toutes les pages
import { Providers } from "@/components/layout/providers";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
// Toaster (sonner) = système de notifications "toast" en bas/haut d'écran
import { Toaster } from "sonner";

// Inter = police principale du corps de texte. `variable` expose une variable
// CSS (--font-inter) réutilisée par Tailwind ; `display: swap` évite le texte invisible au chargement.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Plus Jakarta Sans = police d'affichage pour les titres (--font-display)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Métadonnées de la page : titre/onglet, description, mots-clés, icônes et
// réglages PWA (manifest, mode application iOS). Next.js les injecte dans le <head>.
export const metadata: Metadata = {
  applicationName: "AURION",
  title: "AURION - Supervision environnementale",
  description:
    "Supervision environnementale des salles serveurs de la Ville de Maisons-Alfort via capteurs Black Box, SNMPv3, Zabbix et interface AURION.",
  keywords: ["supervision", "zabbix", "snmpv3", "black box", "bts ciel", "maisons-alfort"],
  authors: [{ name: "DSI Maisons-Alfort" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/aurion-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/aurion-icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "AURION",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "AURION - Supervision environnementale",
    description: "Capteurs Black Box, SNMPv3, Zabbix et interface AURION.",
    type: "website",
  },
};

// Composant racine appelé automatiquement par Next.js pour chaque page.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="fr" pour l'accessibilité ; className="dark" force le thème sombre d'AURION
    <html lang="fr" className="dark">
      {/* Les variables de police sont appliquées au body pour tout le site */}
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        {/* Providers enveloppe TOUTES les pages (contexte global partagé) */}
        <Providers>
          {/* children = la page demandée par l'utilisateur */}
          {children}
          {/* Bouton "remonter en haut" présent sur toutes les pages */}
          <ScrollToTop />
          {/* Zone d'affichage des notifications toast (succès/erreurs) */}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.96)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(34, 211, 238, 0.25)",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
