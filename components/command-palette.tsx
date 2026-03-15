"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const commands = [
    { name: "Dashboard", path: "/dashboard", keywords: ["accueil", "home", "tableau"], icon: "📊" },
    { name: "Sites", path: "/sites", keywords: ["batiments", "lieux"], icon: "🏢" },
    { name: "Carte", path: "/carte", keywords: ["map", "geographie"], icon: "🗺️" },
    { name: "Alertes", path: "/alertes", keywords: ["problemes", "incidents"], icon: "🚨" },
    { name: "Historique", path: "/historique", keywords: ["timeline", "evenements"], icon: "📜" },
    { name: "Analytics", path: "/analytics", keywords: ["stats", "graphiques"], icon: "📈" },
    { name: "Admin", path: "/admin", keywords: ["settings", "config"], icon: "⚙️" },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords.some(k => k.includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <Card className="shadow-2xl shadow-nebula-violet/30">
                {/* Search Input */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une page ou une commande..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                    />
                    <Badge variant="info" className="text-xs">
                      <Command className="w-3 h-3 mr-1" />
                      ESC
                    </Badge>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {filteredCommands.map((cmd, index) => (
                    <motion.button
                      key={cmd.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(cmd.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-nebula hover:shadow-neon-sm transition-all text-left group"
                    >
                      <span className="text-2xl">{cmd.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-white">{cmd.name}</p>
                        <p className="text-xs text-gray-400">{cmd.path}</p>
                      </div>
                      <Badge variant="info" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Entrée
                      </Badge>
                    </motion.button>
                  ))}

                  {filteredCommands.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun résultat trouvé</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>↑↓ pour naviguer</span>
                    <span>↵ pour sélectionner</span>
                  </div>
                  <span>ESC pour fermer</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
