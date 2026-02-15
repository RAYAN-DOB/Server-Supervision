import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AurionAIChat } from "@/components/aurion-ai-chat";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { EasterEgg } from "@/components/easter-egg";
import { ScrollToTop } from "@/components/scroll-to-top";
import { StatusIndicator } from "@/components/status-indicator";
import { CommandPalette } from "@/components/command-palette";
import { CosmicBackground } from "@/components/cosmic-background";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AURION - Supervision Serveurs Maisons-Alfort",
  description: "Système de supervision et monitoring des salles serveurs et baies réseau de la Ville de Maisons-Alfort",
  keywords: ["supervision", "monitoring", "zabbix", "datacenter", "serveurs", "maisons-alfort"],
  authors: [{ name: "DSI Maisons-Alfort" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AURION - Supervision Serveurs",
    description: "Système de supervision des infrastructures IT de Maisons-Alfort",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <CosmicBackground />
        <Providers>
          {children}
          <AurionAIChat />
          <CommandPalette />
          <KeyboardShortcutsHelp />
          <PerformanceMonitor />
          <EasterEgg />
          <ScrollToTop />
          <StatusIndicator />
          <Toaster 
            position="top-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(10, 10, 26, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(106, 0, 255, 0.3)",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
