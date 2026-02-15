"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
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

  const shortcuts = [
    { keys: ['G', 'D'], description: 'Aller au Dashboard' },
    { keys: ['G', 'S'], description: 'Aller aux Sites' },
    { keys: ['G', 'A'], description: 'Aller aux Alertes' },
    { keys: ['G', 'H'], description: 'Aller à l\'Historique' },
    { keys: ['G', 'M'], description: 'Aller à la Carte' },
    { keys: ['?'], description: 'Afficher cette aide' },
    { keys: ['ESC'], description: 'Fermer les modales' },
  ];

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 left-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          variant="glass"
          className="rounded-full shadow-neon-md hover:shadow-neon-lg"
          title="Raccourcis clavier (Shift + ?)"
        >
          <Keyboard className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Modal */}
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

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Card className="w-full max-w-md shadow-2xl shadow-nebula-violet/20">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-nebula shadow-neon-md flex items-center justify-center">
                          <Keyboard className="w-5 h-5" />
                        </div>
                        <CardTitle>Raccourcis Clavier</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {shortcuts.map((shortcut, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-sm text-gray-300">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, i) => (
                            <Badge
                              key={i}
                              variant="default"
                              className="font-mono text-xs min-w-[32px] justify-center"
                            >
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}

                    <div className="pt-4 border-t border-white/10 text-center">
                      <p className="text-xs text-gray-500">
                        Appuyez sur <kbd className="px-2 py-1 rounded bg-white/10">Shift + ?</kbd> pour afficher cette aide
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
