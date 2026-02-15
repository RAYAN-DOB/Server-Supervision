"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Sparkles, Zap, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { generateAIResponse, generateSuggestions } from "@/lib/ai/aurion-ai";
import type { ChatMessage } from "@/types";

export function AurionAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, addChatMessage, sites, alerts } = useStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (sites.length > 0) {
      setSuggestions(generateSuggestions(sites, alerts));
    }
  }, [sites, alerts]);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-chatbot', handleClose);
    return () => window.removeEventListener('close-chatbot', handleClose);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    setInput("");

    setIsTyping(true);
    
    // Simulate AI thinking time (realistic delay)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    const response = await generateAIResponse({
      sites,
      alerts,
      userQuery: input,
      conversationHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
    });
    
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(aiMessage);
    setIsTyping(false);

    // Update suggestions after response
    setSuggestions(generateSuggestions(sites, alerts));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
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
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-nebula-violet to-nebula-magenta shadow-lg shadow-nebula-violet/30 hover:shadow-xl hover:shadow-nebula-violet/40 transition-all flex items-center justify-center group"
            >
              <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020208]"
              />
            </motion.button>
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex flex-col"
          >
            <div className="clean-card h-full flex flex-col shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="p-5 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-violet to-nebula-magenta flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020208]"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">AURION IA</h3>
                      <p className="text-xs text-gray-500 font-light">Assistant Intelligent</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-nebula-violet" />
                    </motion.div>
                    <p className="text-sm font-medium text-white mb-2">Bonjour ! Je suis AURION IA 🤖</p>
                    <p className="text-xs text-gray-500 font-light mb-6">
                      Posez-moi des questions sur votre infrastructure IT
                    </p>
                    
                    {/* Smart Suggestions */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 mb-2">Suggestions :</p>
                      {suggestions.map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-nebula-violet/30 transition-all text-xs text-gray-400"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula-violet to-nebula-magenta flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-nebula-violet to-nebula-magenta text-white"
                          : "bg-white/[0.03] border border-white/[0.06] text-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line font-light leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula-violet to-nebula-magenta flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-nebula-violet animate-spin" />
                      <span className="text-sm text-gray-400 font-light">AURION IA analyse...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSendMessage()}
                    placeholder="Posez votre question..."
                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    disabled={isTyping}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-nebula-violet to-nebula-magenta disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                
                <p className="text-[10px] text-gray-700 mt-2 font-light text-center">
                  IA alimentée par l'analyse de vos {sites.length} sites en temps réel
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
