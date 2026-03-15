"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export function FloatingCounter({ value, label, suffix = "" }: FloatingCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [prevValue, setPrevValue] = useState(0);

  useEffect(() => {
    if (displayValue !== value) {
      setPrevValue(displayValue);
      
      let current = displayValue;
      const increment = (value - current) / 30;
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="relative">
      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayValue}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            style={{
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>
        {suffix && (
          <span className="text-2xl text-gray-500 font-light">{suffix}</span>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-500 font-light mt-1 uppercase tracking-wider"
      >
        {label}
      </motion.p>
    </div>
  );
}
