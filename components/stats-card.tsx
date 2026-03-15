"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "violet" | "cyan" | "magenta" | "green" | "red" | "yellow";
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "violet",
  delay = 0 
}: StatsCardProps) {
  const colorClasses = {
    violet: "from-nebula-violet to-purple-600",
    cyan: "from-nebula-cyan to-blue-500",
    magenta: "from-nebula-magenta to-pink-600",
    green: "from-green-500 to-emerald-600",
    red: "from-red-500 to-pink-500",
    yellow: "from-yellow-500 to-orange-500",
  };

  const iconColors = {
    violet: "text-nebula-violet",
    cyan: "text-nebula-cyan",
    magenta: "text-nebula-magenta",
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className="relative overflow-hidden group">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${colorClasses[color]} opacity-20`} />
        </div>

        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
              <motion.p 
                className="text-3xl font-bold gradient-text"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
              >
                {value}
              </motion.p>
              {trend && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.4 }}
                  className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <span>{trend.isPositive ? "↗" : "↘"}</span>
                  <span>{trend.value}</span>
                </motion.div>
              )}
            </div>

            {/* Animated Icon */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, type: "spring" }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} opacity-10 flex items-center justify-center group-hover:opacity-20 transition-opacity`}
            >
              <Icon className={`w-7 h-7 ${iconColors[color]}`} />
            </motion.div>
          </div>
        </CardContent>

        {/* Bottom Shine Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
      </Card>
    </motion.div>
  );
}
