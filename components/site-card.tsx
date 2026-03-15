"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, AlertTriangle, Thermometer, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Site } from "@/types";
import { formatTemperature } from "@/lib/utils";

interface SiteCardProps {
  site: Site;
  index?: number;
}

export function SiteCard({ site, index = 0 }: SiteCardProps) {
  return (
    <Link href={`/sites/${site.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          scale: 1.03, 
          y: -8,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="h-full cursor-pointer group relative overflow-hidden">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-nebula opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />

          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <motion.div 
                className="p-3 rounded-xl bg-gradient-nebula shadow-neon-md group-hover:shadow-neon-lg transition-all"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Building2 className="w-6 h-6" />
              </motion.div>
              <Badge 
                variant={site.status as any}
                className="group-hover:scale-110 transition-transform"
              >
                {site.status}
              </Badge>
            </div>
            <CardTitle className="group-hover:gradient-text transition-all text-lg">
              {site.name}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-1">
              {site.address}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1">Baies</p>
                <p className="font-semibold gradient-text text-lg">{site.bayCount}</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1">Alertes</p>
                <div className="flex items-center gap-1">
                  {site.alertCount > 0 && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  <p className={`font-semibold text-lg ${site.alertCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {site.alertCount}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  Temp.
                </p>
                <p className="font-semibold text-lg">{formatTemperature(site.temperature)}</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Uptime
                </p>
                <p className="font-semibold text-green-400 text-lg">{site.uptime}%</p>
              </motion.div>
            </div>

            {/* Type Badge */}
            <div className="pt-3 border-t border-white/10">
              <Badge 
                variant="info" 
                className="capitalize text-xs group-hover:bg-nebula-violet/20 group-hover:border-nebula-violet/50 transition-all"
              >
                {site.type}
              </Badge>
            </div>
          </CardContent>

          {/* Bottom Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-nebula opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      </motion.div>
    </Link>
  );
}
