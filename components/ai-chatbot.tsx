"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/types";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, addChatMessage, sites, alerts } = useStore();

  // Listen for close event
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-chatbot', handleClose);
    return () => window.removeEventListener('close-chatbot', handleClose);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Simple NLP - Pattern matching
  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Temperature queries
    if (msg.includes("température") || msg.includes("temp")) {
      if (msg.includes("palais") || msg.includes("sport")) {
        const site = sites.find(s => s.name.includes("Palais"));
        return site
          ? `La température au ${site.name} est actuellement de ${site.temperature.toFixed(1)}°C. ${site.temperature > 25 ? "⚠️ Attention, c'est au-dessus de la normale." : "✅ Tout est normal."}`
          : "Je n'ai pas trouvé d'information sur le Palais des Sports.";
      }
      const avgTemp = sites.reduce((sum, s) => sum + s.temperature, 0) / (sites.length || 1);
      return `La température moyenne sur tous les sites est de ${avgTemp.toFixed(1)}°C.`;
    }

    // Alerts queries
    if (msg.includes("alerte") || msg.includes("problème") || msg.includes("critique")) {
      const activeAlerts = alerts.filter(a => !a.acknowledged);
      const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
      
      if (criticalAlerts.length > 0) {
        return `🚨 Il y a ${criticalAlerts.length} alerte(s) critique(s) en ce moment :\n${criticalAlerts.map(a => `- ${a.title} à ${a.siteName}`).join("\n")}`;
      }
      if (activeAlerts.length > 0) {
        return `⚠️ ${activeAlerts.length} alerte(s) active(s). ${activeAlerts.filter(a => a.severity === "major").length} majeures, ${activeAlerts.filter(a => a.severity === "minor").length} mineures.`;
      }
      return "✅ Aucune alerte active pour le moment. Tous les systèmes fonctionnent normalement.";
    }

    // Sites queries
    if (msg.includes("combien") && msg.includes("site")) {
      return `Il y a actuellement ${sites.length} sites surveillés à Maisons-Alfort, répartis sur ${sites.reduce((sum, s) => sum + s.bayCount, 0)} baies serveur.`;
    }

    // Status queries
    if (msg.includes("état") || msg.includes("statut") || msg.includes("status")) {
      const okSites = sites.filter(s => s.status === "ok").length;
      const warningSites = sites.filter(s => s.status === "warning").length;
      const criticalSites = sites.filter(s => s.status === "critical").length;
      return `📊 État global :\n✅ ${okSites} sites OK\n⚠️ ${warningSites} en warning\n🚨 ${criticalSites} critiques`;
    }

    // Help
    if (msg.includes("aide") || msg.includes("help") || msg.includes("commande")) {
      return `Je peux vous aider avec :\n• 📊 État des sites et alertes\n• 🌡️ Informations sur la température\n• 🔔 Alertes actives\n• 📍 Informations sur un site spécifique\n\nEssayez par exemple :\n"Quelle est la température au Palais des Sports ?"\n"Y a-t-il des alertes critiques ?"\n"Combien de sites sont surveillés ?"`;
    }

    // List sites
    if (msg.includes("liste") && msg.includes("site")) {
      return `Voici les 12 sites surveillés :\n${sites.slice(0, 6).map((s, i) => `${i + 1}. ${s.name} (${s.status})`).join("\n")}\n... et 6 autres sites.`;
    }

    // Default response
    return "Je n'ai pas bien compris votre question. Tapez 'aide' pour voir ce que je peux faire. 🤖";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    setInput("");

    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(input);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMessage);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-16 h-16 shadow-neon-lg hover:shadow-neon-xl"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="h-[500px] flex flex-col shadow-2xl shadow-nebula-violet/20">
              {/* Header */}
              <CardHeader className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-nebula shadow-neon-md flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">MA-IA Assistant</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">En ligne</span>
                      </div>
                    </div>
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

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-nebula-cyan opacity-50" />
                    <p className="text-sm text-gray-400 mb-2">Bonjour ! Je suis MA-IA 🤖</p>
                    <p className="text-xs text-gray-500">Posez-moi des questions sur l'état de vos infrastructures !</p>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-nebula flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-nebula text-white"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-nebula flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Posez votre question..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-nebula-violet/50 transition-all"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
