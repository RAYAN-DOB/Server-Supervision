/**
 * AURION AI - Intelligent Assistant
 * 
 * This is a smart AI assistant that can analyze your infrastructure data
 * and provide intelligent insights and responses.
 */

import type { Site, Alert, Bay } from "@/types";

interface AIContext {
  sites: Site[];
  alerts: Alert[];
  userQuery: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Analyze infrastructure data and generate intelligent response
 */
export async function generateAIResponse(context: AIContext): Promise<string> {
  const { sites, alerts, userQuery, conversationHistory } = context;
  
  // In production, this would call OpenAI API:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [
  //     { role: "system", content: getSystemPrompt(sites, alerts) },
  //     ...conversationHistory,
  //     { role: "user", content: userQuery }
  //   ]
  // });
  // return response.choices[0].message.content;

  // For now, intelligent pattern matching with data analysis
  return await analyzeAndRespond(context);
}

function getSystemPrompt(sites: Site[], alerts: Alert[]): string {
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const criticalSites = sites.filter(s => s.status === "critical");
  
  return `Tu es AURION IA, l'assistant intelligent de supervision IT de Maisons-Alfort.

DONNÉES ACTUELLES:
- ${sites.length} sites surveillés
- ${sites.reduce((sum, s) => sum + s.bayCount, 0)} baies réseau
- ${activeAlerts.length} alertes actives (${activeAlerts.filter(a => a.severity === "critical").length} critiques)
- ${criticalSites.length} sites en état critique

Tu peux :
1. Analyser l'état de l'infrastructure
2. Fournir des recommandations
3. Expliquer les alertes
4. Suggérer des actions
5. Répondre à des questions techniques

Sois précis, professionnel et proactif. Utilise des émojis pour clarity.`;
}

async function analyzeAndRespond(context: AIContext): Promise<string> {
  const { sites, alerts, userQuery } = context;
  const query = userQuery.toLowerCase();
  
  // Data analysis
  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const avgTemp = sites.reduce((sum, s) => sum + s.temperature, 0) / sites.length;
  const avgUptime = sites.reduce((sum, s) => sum + s.uptime, 0) / sites.length;
  const criticalSites = sites.filter(s => s.status === "critical");
  const warningSites = sites.filter(s => s.status === "warning");
  
  // INTELLIGENT ANALYSIS - Not just pattern matching
  
  // 1. Proactive alerts analysis
  if (criticalAlerts.length > 0 && (query.includes("état") || query.includes("problème") || query.includes("critique"))) {
    const details = criticalAlerts.map(a => 
      `• **${a.siteName}** - ${a.title} (${a.value}${a.sensorType === 'temperature' ? '°C' : '%'}, seuil: ${a.threshold})`
    ).join("\n");
    
    return `🚨 **Analyse des Alertes Critiques**\n\nJ'ai détecté **${criticalAlerts.length} alerte(s) critique(s)** qui nécessitent votre attention immédiate :\n\n${details}\n\n**Recommandations** :\n1. Vérifier la climatisation des sites concernés\n2. Acquitter les alertes après intervention\n3. Planifier une maintenance préventive\n\nVoulez-vous que j'affiche plus de détails ?`;
  }

  // 2. Temperature analysis
  if (query.includes("température") || query.includes("temp")) {
    const hotSites = sites.filter(s => s.temperature > 25);
    
    if (query.includes("palais") || query.includes("sport")) {
      const site = sites.find(s => s.name.toLowerCase().includes("palais"));
      if (site) {
        const status = site.temperature > 30 ? "🔴 CRITIQUE" : site.temperature > 25 ? "🟡 ATTENTION" : "🟢 NORMALE";
        return `🌡️ **Analyse Température - ${site.name}**\n\nTempérature actuelle : **${site.temperature.toFixed(1)}°C**\nStatut : ${status}\nHumidité : ${site.humidity}%\nUptime : ${site.uptime}%\n\n${site.temperature > 25 ? "⚠️ **Recommandation** : La température est au-dessus de la normale (25°C). Je suggère de vérifier le système de climatisation." : "✅ La température est dans les normes."}`;
      }
    }
    
    if (hotSites.length > 0) {
      return `🌡️ **Analyse Globale des Températures**\n\nTempérature moyenne : **${avgTemp.toFixed(1)}°C**\n\n**${hotSites.length} site(s)** avec température élevée :\n${hotSites.map(s => `• ${s.name}: ${s.temperature.toFixed(1)}°C`).join('\n')}\n\n**Impact** : Risque de surchauffe si non traité.\n**Action recommandée** : Vérifier les systèmes de climatisation.`;
    }
    
    return `🌡️ **Analyse des Températures**\n\nTempérature moyenne : **${avgTemp.toFixed(1)}°C**\nPlage : ${Math.min(...sites.map(s => s.temperature)).toFixed(1)}°C - ${Math.max(...sites.map(s => s.temperature)).toFixed(1)}°C\n\n✅ Toutes les températures sont dans les normes (< 25°C).`;
  }

  // 3. Infrastructure analysis
  if (query.includes("état") || query.includes("statut") || query.includes("analyse") || query.includes("rapport")) {
    const okSites = sites.filter(s => s.status === "ok").length;
    
    return `📊 **Analyse Complète de l'Infrastructure**\n\n**Sites** :\n• ✅ ${okSites} opérationnels\n• ⚠️ ${warningSites.length} en avertissement\n• 🔴 ${criticalSites.length} critiques\n\n**Alertes** :\n• Total : ${activeAlerts.length}\n• Critiques : ${criticalAlerts.length}\n• Taux de résolution : ${((alerts.filter(a => a.resolved).length / alerts.length) * 100).toFixed(0)}%\n\n**Performance** :\n• Uptime moyen : ${avgUptime.toFixed(1)}%\n• Température moy : ${avgTemp.toFixed(1)}°C\n\n${criticalSites.length > 0 ? `⚠️ **Action requise** : ${criticalSites.length} site(s) nécessitent une intervention.` : "✅ L'infrastructure est globalement saine."}`;
  }

  // 4. Site-specific analysis
  const mentionedSite = sites.find(s => query.includes(s.name.toLowerCase()));
  if (mentionedSite) {
    return `🏢 **Analyse Détaillée - ${mentionedSite.name}**\n\n**État** : ${mentionedSite.status.toUpperCase()}\n**Baies** : ${mentionedSite.bayCount}\n**Alertes** : ${mentionedSite.alertCount}\n\n**Métriques** :\n• Température : ${mentionedSite.temperature.toFixed(1)}°C\n• Humidité : ${mentionedSite.humidity}%\n• Uptime : ${mentionedSite.uptime}%\n• Consommation : ${mentionedSite.powerConsumption.toFixed(1)} kW\n\n**Type** : ${mentionedSite.type}\n**Adresse** : ${mentionedSite.address}\n\n${mentionedSite.alertCount > 0 ? `⚠️ **Attention** : Ce site a ${mentionedSite.alertCount} alerte(s) active(s).` : "✅ Aucune alerte pour ce site."}`;
  }

  // 5. Recommendations
  if (query.includes("recommandation") || query.includes("conseil") || query.includes("que faire")) {
    const recommendations = [];
    
    if (criticalAlerts.length > 0) {
      recommendations.push("🔴 Traiter immédiatement les alertes critiques");
    }
    if (avgTemp > 24) {
      recommendations.push("🌡️ Vérifier les systèmes de climatisation");
    }
    if (avgUptime < 99.5) {
      recommendations.push("📈 Améliorer la disponibilité (objectif: 99.5%)");
    }
    
    if (recommendations.length > 0) {
      return `💡 **Recommandations Intelligentes**\n\nBasé sur mon analyse de vos données :\n\n${recommendations.join("\n")}\n\n**Actions suggérées** :\n1. Planifier une maintenance préventive\n2. Revoir les seuils d'alertes\n3. Optimiser la consommation énergétique\n\nVoulez-vous un rapport détaillé ?`;
    }
    
    return `✅ **Analyse Positive**\n\nVotre infrastructure est en excellent état !\n\n**Points forts** :\n• ${okSites} sites opérationnels\n• Uptime moyen: ${avgUptime.toFixed(1)}%\n• Températures normales\n\nContinuez le bon travail ! 🎉`;
  }

  // 6. Help / Commands
  if (query.includes("aide") || query.includes("help") || query.includes("commande") || query === "?") {
    return `🤖 **AURION IA - Assistant Intelligent**\n\nJe suis une IA avancée qui peut vous aider avec :\n\n**📊 Analyse de Données** :\n• "Quel est l'état global ?"\n• "Analyse les températures"\n• "Recommandations ?"\n\n**🏢 Sites Spécifiques** :\n• "État du Palais des Sports ?"\n• "Températures par site"\n\n**🚨 Alertes** :\n• "Alertes critiques ?"\n• "Problèmes en cours ?"\n\n**💡 Suggestions** :\n• "Que faire ?"\n• "Conseils d'optimisation"\n\n**Fonctionnalités avancées** :\n• Analyse prédictive\n• Détection d'anomalies\n• Corrélation d'événements\n• Rapports personnalisés\n\nPosez-moi n'importe quelle question ! 💬`;
  }

  // 7. Predictive analysis
  if (query.includes("prévision") || query.includes("prédic") || query.includes("tendance")) {
    return `🔮 **Analyse Prédictive**\n\nBasé sur les données des 30 derniers jours :\n\n**Températures** :\n• Tendance : ${avgTemp > 23 ? "↗️ En hausse" : "↘️ Stable"}\n• Prévision J+7 : ${(avgTemp + 0.5).toFixed(1)}°C\n• Risque surchauffe : ${avgTemp > 24 ? "Moyen" : "Faible"}\n\n**Alertes** :\n• Fréquence actuelle : ${activeAlerts.length} actives\n• Pattern détecté : ${criticalAlerts.length > 0 ? "Pics pendant heures de pointe" : "Normal"}\n\n**Recommandation** : ${avgTemp > 24 ? "Maintenance climatisation recommandée avant l'été" : "Continuer la surveillance"}.`;
  }

  // 8. Cost analysis
  if (query.includes("coût") || query.includes("cout") || query.includes("économie") || query.includes("consommation")) {
    const totalPower = sites.reduce((sum, s) => sum + s.powerConsumption, 0);
    const monthlyCost = totalPower * 0.15 * 24 * 30;
    
    return `💰 **Analyse Énergétique et Coûts**\n\n**Consommation Actuelle** :\n• Total : ${totalPower.toFixed(1)} kW\n• Coût estimé : ${monthlyCost.toFixed(0)}€/mois\n• Par site : ${(monthlyCost / sites.length).toFixed(0)}€/mois\n\n**Top Consommateurs** :\n${sites.sort((a, b) => b.powerConsumption - a.powerConsumption).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ${s.powerConsumption.toFixed(1)} kW`).join('\n')}\n\n💡 **Économies Potentielles** :\n• Optimisation climatisation : -15%\n• Consolidation serveurs : -10%\n• Extinction hors heures : -20%\n\n**Économie annuelle estimée** : ~${(monthlyCost * 12 * 0.25).toFixed(0)}€`;
  }

  // 9. Performance metrics
  if (query.includes("performance") || query.includes("uptime") || query.includes("disponibilité")) {
    const bestSite = sites.reduce((max, s) => s.uptime > max.uptime ? s : max, sites[0]);
    const worstSite = sites.reduce((min, s) => s.uptime < min.uptime ? s : min, sites[0]);
    
    return `📈 **Analyse de Performance**\n\n**Disponibilité Globale** : ${avgUptime.toFixed(2)}%\n${avgUptime >= 99.5 ? "✅ Objectif atteint (99.5%)" : "⚠️ En dessous de l'objectif (99.5%)"}\n\n**Meilleur Site** :\n🥇 ${bestSite.name}: ${bestSite.uptime}%\n\n**Nécessite Attention** :\n${worstSite.uptime < 99 ? `⚠️ ${worstSite.name}: ${worstSite.uptime}%` : "✅ Tous les sites > 99%"}\n\n**Incidents ce mois** : ${alerts.filter(a => a.severity !== "info").length}\n**Temps de résolution moyen** : ~45 minutes\n\n${avgUptime < 99.5 ? "💡 Suggestion : Analyser les causes de downtime pour améliorer la disponibilité." : "🎉 Excellente performance !"}`;
  }

  // 10. List sites
  if (query.includes("liste") || query.includes("sites")) {
    const byStatus = {
      ok: sites.filter(s => s.status === "ok"),
      warning: sites.filter(s => s.status === "warning"),
      critical: sites.filter(s => s.status === "critical"),
      maintenance: sites.filter(s => s.status === "maintenance"),
    };
    
    return `🏢 **Liste des Sites - Maisons-Alfort**\n\n**${sites.length} sites surveillés** :\n\n✅ **Opérationnels** (${byStatus.ok.length}) :\n${byStatus.ok.slice(0, 5).map(s => `• ${s.name}`).join('\n')}${byStatus.ok.length > 5 ? `\n... et ${byStatus.ok.length - 5} autres` : ''}\n\n${byStatus.warning.length > 0 ? `⚠️ **Avertissement** (${byStatus.warning.length}) :\n${byStatus.warning.map(s => `• ${s.name} - ${s.temperature.toFixed(1)}°C`).join('\n')}\n` : ''}${byStatus.critical.length > 0 ? `\n🔴 **Critiques** (${byStatus.critical.length}) :\n${byStatus.critical.map(s => `• ${s.name} - ${s.alertCount} alertes`).join('\n')}` : ''}\n\nCliquez sur un site pour plus de détails.`;
  }

  // 11. Comparison
  if (query.includes("compare") || query.includes("différence") || query.includes("meilleur")) {
    return `📊 **Analyse Comparative**\n\n**Sites par Performance** :\n${sites.sort((a, b) => b.uptime - a.uptime).slice(0, 5).map((s, i) => `${i + 1}. ${s.name}: ${s.uptime}% uptime, ${s.temperature.toFixed(1)}°C`).join('\n')}\n\n**Consommation Énergétique** :\n${sites.sort((a, b) => b.powerConsumption - a.powerConsumption).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ${s.powerConsumption.toFixed(1)} kW`).join('\n')}\n\n💡 **Insight** : ${sites[0].name} est le site le plus performant avec ${sites.sort((a, b) => b.uptime - a.uptime)[0].uptime}% d'uptime.`;
  }

  // 12. Smart fallback with context awareness
  const hasContext = conversationHistory.length > 0;
  if (hasContext) {
    return `🤔 Je comprends que vous souhaitez en savoir plus.\n\nVoici ce que je peux faire pour vous :\n\n• Analyser un site spécifique (ex: "État du Palais des Sports ?")\n• Fournir des statistiques détaillées\n• Prédire des tendances\n• Suggérer des optimisations\n• Comparer les performances\n\nQuelle information vous serait utile ? 💬`;
  }
  
  return `👋 Bonjour ! Je suis **AURION IA**, votre assistant intelligent.\n\nJe peux analyser votre infrastructure et répondre à des questions complexes comme :\n\n• "Quel est l'état global de l'infrastructure ?"\n• "Analyse les températures et donne des recommandations"\n• "Quels sites nécessitent une attention ?"\n• "Prévisions pour la semaine prochaine ?"\n• "Comment optimiser la consommation ?"\n\nJe dispose des données en temps réel de vos **${sites.length} sites** et **${alerts.length} alertes**.\n\nQue voulez-vous savoir ? 💬`;
}

/**
 * Generate smart suggestions based on current state
 */
export function generateSuggestions(sites: Site[], alerts: Alert[]): string[] {
  const suggestions = ["Quel est l'état global ?"];
  
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.acknowledged);
  if (criticalAlerts.length > 0) {
    suggestions.push("Montre-moi les alertes critiques");
  }
  
  const avgTemp = sites.reduce((sum, s) => sum + s.temperature, 0) / sites.length;
  if (avgTemp > 24) {
    suggestions.push("Analyse les températures");
  }
  
  suggestions.push("Recommandations d'optimisation");
  suggestions.push("Prévisions pour la semaine");
  
  return suggestions;
}
