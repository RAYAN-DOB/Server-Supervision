"use client";

// Composant côté navigateur : il utilise Framer Motion pour les animations hover/clic.
// À expliquer au jury : ce fichier affiche une carte réutilisable pour un site supervisé.

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, AlertTriangle, Thermometer, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Site } from "@/types";
import { formatTemperature } from "@/lib/utils";

interface SiteCardProps {
  site: Site;
  // site : objet contenant les informations du site à afficher.
  // Exemple : nom, adresse, statut, température, nombre de baies, alertes.

  index?: number;
  // index : position de la carte dans la liste.
  // Il sert uniquement à décaler légèrement l'animation d'apparition entre les cartes.
}

export function SiteCard({ site, index = 0 }: SiteCardProps) {
  // SiteCard reçoit un site en entrée et renvoie une carte cliquable.
  // Logique simple à l'oral : entrée = données du site, sortie = affichage visuel dans le dashboard.

  return (
    <Link href={`/sites/${site.id}`}>
      {/* Link permet d'ouvrir la page de détail du site lorsque l'utilisateur clique sur la carte. */}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        // État initial : carte légèrement transparente, plus petite et décalée vers le bas.

        animate={{ opacity: 1, scale: 1, y: 0 }}
        // État final : carte visible, taille normale et position normale.

        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          // Le délai dépend de l'index pour créer une apparition progressive des cartes.

          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          scale: 1.03, 
          y: -8,
          transition: { duration: 0.2 }
        }}
        // Animation au survol : la carte remonte légèrement pour donner un effet interactif.

        whileTap={{ scale: 0.98 }}
        // Animation au clic : la carte se réduit très légèrement.
      >
        <Card className="h-full cursor-pointer group relative overflow-hidden">
          {/* Card est le conteneur visuel principal du site. */}

          {/* Effet de bordure lumineuse au survol */}
          <div className="absolute inset-0 bg-gradient-nebula opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          {/* Effet de reflet qui traverse la carte au survol */}
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
                {/* Icône bâtiment : représente le site municipal supervisé. */}
              </motion.div>

              <Badge 
                variant={site.status as any}
                className="group-hover:scale-110 transition-transform"
              >
                {site.status}
                {/* Statut du site : exemple ok, warning, critical. */}
              </Badge>
            </div>

            <CardTitle className="group-hover:gradient-text transition-all text-lg">
              {site.name}
              {/* Nom du site affiché dans la carte. */}
            </CardTitle>

            <CardDescription className="text-xs line-clamp-1">
              {site.address}
              {/* Adresse ou localisation courte du site. */}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Grille des indicateurs principaux du site */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1">Baies</p>
                <p className="font-semibold gradient-text text-lg">{site.bayCount}</p>
                {/* Nombre de baies ou zones suivies dans ce site. */}
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-nebula-violet/30 transition-all"
              >
                <p className="text-gray-400 text-xs mb-1">Alertes</p>
                <div className="flex items-center gap-1">
                  {site.alertCount > 0 && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  {/* L'icône alerte apparaît uniquement si le site possède au moins une alerte. */}

                  <p className={`font-semibold text-lg ${site.alertCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {site.alertCount}
                  </p>
                  {/* Si alertCount > 0 : texte rouge. Sinon : texte vert. */}
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
                {/* Température formatée avec l'unité °C grâce à formatTemperature. */}
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
                {/* Uptime : indicateur de disponibilité du site ou du service. */}
              </motion.div>
            </div>

            {/* Badge de type de site */}
            <div className="pt-3 border-t border-white/10">
              <Badge 
                variant="info" 
                className="capitalize text-xs group-hover:bg-nebula-violet/20 group-hover:border-nebula-violet/50 transition-all"
              >
                {site.type}
                {/* Type du site : serveur, bâtiment, démonstration, etc. */}
              </Badge>
            </div>
          </CardContent>

          {/* Barre lumineuse basse au survol */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-nebula opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      </motion.div>
    </Link>
  );
}
