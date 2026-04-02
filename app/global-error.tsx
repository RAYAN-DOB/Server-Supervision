"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="fr" className="dark">
      <body className="bg-[#020208] font-sans antialiased">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 max-w-md px-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">Erreur critique</h1>
              <p className="text-sm text-gray-400">
                Une erreur critique s&apos;est produite. Veuillez recharger la page.
              </p>
              {error.digest && (
                <p className="text-xs text-gray-600 font-mono">Réf: {error.digest}</p>
              )}
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:border-white/20 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
