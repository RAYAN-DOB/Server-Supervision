"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut,
} from "lucide-react";
import { AurionLogoFull } from "@/components/aurion-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// ─── Indicateur de force du mot de passe ─────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Trop faible", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Faible", color: "bg-orange-500" };
  if (score <= 4) return { score, label: "Moyen", color: "bg-yellow-500" };
  if (score <= 5) return { score, label: "Fort", color: "bg-green-400" };
  return { score, label: "Très fort", color: "bg-emerald-500" };
}

// ─── Critères de validation ────────────────────────────────────────────────────

function PasswordCriteria({
  password,
}: {
  password: string;
}) {
  const criteria = [
    { label: "Au moins 12 caractères", ok: password.length >= 12 },
    { label: "Une lettre majuscule (A–Z)", ok: /[A-Z]/.test(password) },
    { label: "Une lettre minuscule (a–z)", ok: /[a-z]/.test(password) },
    { label: "Un chiffre (0–9)", ok: /[0-9]/.test(password) },
    {
      label: "Un caractère spécial (!@#$%...)",
      ok: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="space-y-1.5 mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      {criteria.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <CheckCircle2
            className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
              ok ? "text-green-400" : "text-gray-600"
            }`}
          />
          <span className={ok ? "text-gray-300" : "text-gray-600"}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (strength.score < 5) {
      setError(
        "Le mot de passe ne respecte pas tous les critères de sécurité"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors du changement de mot de passe");
        setLoading(false);
        return;
      }

      toast.success("Mot de passe modifié avec succès !", {
        description: "Bienvenue dans AURION — Supervision DSI",
      });

      // Rechargement pour que le nouveau JWT (sans mustChangePassword) soit pris en compte
      window.location.href = "/dashboard";
    } catch {
      setError("Erreur réseau — réessayez");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-nebula-violet/10 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Bandeau d'avertissement */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Changement de mot de passe requis
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Pour des raisons de sécurité, vous devez définir un mot de passe
              personnel avant d'accéder à l'application.
            </p>
          </div>
        </motion.div>

        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-4">
              <AurionLogoFull />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-nebula-violet" />
              <CardTitle className="text-xl font-bold text-white">
                Définir votre mot de passe
              </CardTitle>
            </div>
            <CardDescription className="font-light text-sm">
              DSI · Ville de Maisons-Alfort
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mot de passe actuel (temporaire) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe temporaire
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mot de passe fourni par la DSI"
                    className="w-full pl-10 pr-12 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 12 caractères"
                    className="w-full pl-10 pr-12 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Barre de force */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Force :</span>
                      <span
                        className={`text-xs font-medium ${
                          strength.score >= 5
                            ? "text-green-400"
                            : strength.score >= 4
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < strength.score
                              ? strength.color
                              : "bg-white/[0.06]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Critères */}
                {newPassword && <PasswordCriteria password={newPassword} />}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le nouveau mot de passe"
                    className={`w-full pl-10 pr-12 py-3 bg-white/[0.03] border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none transition-all font-light ${
                      passwordsMismatch
                        ? "border-red-500/50 focus:border-red-500/70"
                        : passwordsMatch
                        ? "border-green-500/50 focus:border-green-500/70"
                        : "border-white/[0.06] focus:border-nebula-violet/50"
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordsMatch && (
                  <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Les mots de passe correspondent
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}

              {/* Bouton submit */}
              <Button
                type="submit"
                disabled={loading || strength.score < 5 || !passwordsMatch}
                className="w-full bg-gradient-to-r from-nebula-violet to-nebula-magenta hover:shadow-lg hover:shadow-nebula-violet/20 transition-all py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Définir mon mot de passe
                  </>
                )}
              </Button>

              {/* Lien déconnexion */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6 font-light">
          © 2026 Ville de Maisons-Alfort · DSI
        </p>
      </motion.div>
    </div>
  );
}
