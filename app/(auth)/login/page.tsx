"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { AurionLogoFull } from "@/components/features/aurion-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

export default function LoginPage() {
  const { setCurrentUser } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Identifiants incorrects");
        setLoading(false);
        return;
      }

      setCurrentUser(data.user);

      toast.success("Connexion réussie", {
        description: `Bienvenue ${data.user.name}`,
      });

      if (data.mustChangePassword) {
        window.location.href = "/change-password?forced=true";
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Erreur réseau - réessayez");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(37,99,235,0.10),transparent_32%),linear-gradient(135deg,#07111f_0%,#0b1220_48%,#06151b_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1fr_460px]"
        >
          <section className="hidden border-r border-white/10 bg-[#081827]/80 p-10 lg:block">
            <div className="mb-12">
              <AurionLogoFull />
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Supervision DSI
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white">
              Lecture centralisée des salles serveurs et capteurs Black Box.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
              AURION simplifie les données Zabbix pour les techniciens : sites,
              capteurs, seuils, alertes et état SNMPv3.
            </p>

            <div className="mt-10 grid gap-3 text-sm text-slate-200">
              {[
                "Zabbix reste la source de vérité",
                "Collecte SNMPv3 authPriv",
                "Vue claire pour l'exploitation DSI",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 flex justify-center lg:hidden">
              <AurionLogoFull />
            </div>

            <Card className="border-white/10 bg-[#0b1220]/90 shadow-none">
              <CardHeader className="pb-6 pt-8 text-center">
                <CardTitle className="text-2xl font-semibold text-white">
                  Connexion
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Accès sécurisé à la supervision environnementale
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="prenom.nom@maisons-alfort.fr"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300/70 focus:bg-white/[0.08]"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-11 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300/70 focus:bg-white/[0.08]"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 p-3"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
                      <span className="text-sm text-red-200">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-cyan-400 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Shield className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-xs text-slate-500">
              © 2026 Ville de Maisons-Alfort - DSI
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
