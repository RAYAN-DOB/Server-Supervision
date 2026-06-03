import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
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
  title: "AURION - Supervision environnementale",
  description:
    "Supervision environnementale des salles serveurs de la Ville de Maisons-Alfort via capteurs Black Box, SNMPv3, Zabbix et interface AURION.",
  keywords: ["supervision", "zabbix", "snmpv3", "black box", "bts ciel", "maisons-alfort"],
  authors: [{ name: "DSI Maisons-Alfort" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AURION - Supervision environnementale",
    description: "Capteurs Black Box, SNMPv3, Zabbix et interface AURION.",
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
        <Providers>
          {children}
          <ScrollToTop />
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(10, 10, 26, 0.95)",
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
