"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { AurionLogoFull } from "@/components/aurion-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
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

    // Simulate login delay
    setTimeout(() => {
      // Mock authentication
      if (email && password) {
        // Determine role based on email
        let role: "super_admin" | "admin" | "tech" | "viewer" = "viewer";
        if (email.includes("superadmin") || email === "admin@maisons-alfort.fr") {
          role = "super_admin";
        } else if (email.includes("admin")) {
          role = "admin";
        } else if (email.includes("tech")) {
          role = "tech";
        }

        setCurrentUser({
          id: "1",
          username: email.split("@")[0],
          email,
          name: email.includes("admin") ? "Admin DSI" : email.includes("tech") ? "Technicien" : "Utilisateur",
          role,
          department: "DSI Maisons-Alfort",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
        });

        toast.success("Connexion réussie !", {
          description: `Bienvenue ${email.split("@")[0]}`,
        });
        
        router.push("/dashboard");
      } else {
        setError("Email ou mot de passe incorrect");
        toast.error("Échec de connexion");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-nebula-space via-nebula-dark to-nebula-darker" />
      
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-nebula-violet/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nebula-cyan/8 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <AurionLogoFull />
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Connexion
            </CardTitle>
            <CardDescription className="font-light">
              Accédez au système de supervision
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@maisons-alfort.fr"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-nebula-violet to-nebula-magenta hover:shadow-lg hover:shadow-nebula-violet/20 transition-all py-3 text-sm font-semibold"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="w-4 h-4" />
                  </motion.div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs text-gray-500 font-light mb-2">
                <strong className="text-blue-400 font-medium">Mode Démo</strong> - Utilisez n'importe quel email/mot de passe
              </p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• <code className="text-nebula-violet">superadmin@maisons-alfort.fr</code> → Super Admin</p>
                <p>• <code className="text-nebula-violet">admin@maisons-alfort.fr</code> → Admin</p>
                <p>• <code className="text-nebula-violet">tech@maisons-alfort.fr</code> → Technicien</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6 font-light">
          © 2026 Ville de Maisons-Alfort · DSI
        </p>
      </motion.div>
    </div>
  );
}
