"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Shield } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function UserMenu() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Déconnexion réussie");
    router.push("/login");
  };

  const roleLabels = {
    super_admin: "Super Admin",
    admin: "Administrateur",
    tech: "Technicien",
    viewer: "Observateur",
  };

  const roleColors = {
    super_admin: "critical",
    admin: "warning",
    tech: "info",
    viewer: "ok",
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nebula-violet to-nebula-cyan flex items-center justify-center text-[10px] font-semibold">
          {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <span className="text-sm font-medium text-gray-300 hidden sm:block max-w-[120px] truncate">
          {currentUser.name}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 z-50 clean-card p-2 shadow-2xl"
            >
              {/* User Info */}
              <div className="p-3 border-b border-white/[0.06] mb-2">
                <p className="font-semibold text-white text-sm mb-1">{currentUser.name}</p>
                <p className="text-xs text-gray-500 font-light mb-2">{currentUser.email}</p>
                <Badge variant={roleColors[currentUser.role] as any} className="text-[10px]">
                  {roleLabels[currentUser.role]}
                </Badge>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    router.push("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">Paramètres</span>
                </button>

                {(currentUser.role === "super_admin" || currentUser.role === "admin") && (
                  <button
                    onClick={() => {
                      router.push("/admin");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">Gestion utilisateurs</span>
                  </button>
                )}

                <div className="my-2 border-t border-white/[0.06]" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
