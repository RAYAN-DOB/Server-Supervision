"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error("[Auth Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Erreur d'authentification</h2>
          <p className="text-sm text-gray-400">
            {error.message || "Une erreur inattendue s'est produite. Veuillez réessayer."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-600 font-mono">Réf: {error.digest}</p>
          )}
        </div>
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2 border-white/10 hover:border-white/20"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
