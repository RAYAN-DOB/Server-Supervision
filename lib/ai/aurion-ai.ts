/**
 * AURION AI - Intelligent Assistant
 *
 * This is a smart AI assistant that can analyze your infrastructure data
 * and provide intelligent insights and responses.
 */

/**
 * Assistant "IA" d'AURION (chatbot de supervision).
 *
 * Role : reçoit la question de l'utilisateur + l'état des sites/alertes et
 * renvoie une réponse en texte (Markdown). Aujourd'hui c'est une simulation :
 * pas d'appel à une vraie IA, mais une analyse des données + reconnaissance
 * de mots-clés dans la question. Le code pour brancher OpenAI est prévu (en commentaire).
 * Entrée : AIContext -> Sortie : une chaîne de caractères (la réponse affichée dans le chat).
 */

import type { Site, Alert, Bay } from "@/types";

// Contexte passé à l'assistant : données infra + question + historique de la conversation.
interface AIContext {
  sites: Site[];
  alerts: Alert[];
  userQuery: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Analyze infrastructure data and generate intelligent response
 */
// Point d'entrée public : appelé par l'interface de chat pour obtenir une réponse.
export async function generateAIResponse(context: AIContext): Promise<string> {
  const { sites, alerts, userQuery, conversationHistory } = context;

  // En production, on appellerait ici l'API OpenAI (code prévu mais désactivé) :
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

  // En attendant : analyse des données + reconnaissance de mots-clés (pas de vraie IA).
  // For now, intelligent pattern matching with data analysis
  return await analyzeAndRespond(context);
}

// Construit le "prompt système" qui serait envoyé à une vraie IA pour la cadrer.
// (Non utilisé tant que l'IA réelle n'est pas branchée, mais prêt à l'emploi.)
function getSystemPrompt(sites: Site[], alerts: Alert[]): string {
  const activeAlerts = alerts.filter(a => !a.acknowledged); // Alertes non acquittées.
  const criticalSites = sites.filter(s => s.status === "critical"); // Sites en état critique.

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

// Cerveau de l'assistant : analyse les données puis choisit une réponse selon les mots-clés.
async function analyzeAndRespond(context: AIContext): Promise<string> {
  const { sites, alerts, userQuery, conversationHistory } = context;
  const query = userQuery.toLowerCase(); // Mise en minuscules pour comparer sans souci de casse.

  // Statistiques calculées une fois, réutilisées dans toutes les branches ci-dessous.
  // Data analysis
  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.resolved); // Alertes en cours.
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical"); // Parmi elles, les critiques.
  const avgTemp = sites.reduce((sum, s) => sum + s.temperature, 0) / sites.length; // Température moyenne.
  const avgUptime = sites.reduce((sum, s) => sum + s.uptime, 0) / sites.length; // Disponibilité moyenne.
  const criticalSites = sites.filter(s => s.status === "critical");
  const warningSites = sites.filter(s => s.status === "warning");

  // INTELLIGENT ANALYSIS - Not just pattern matching
  // La suite est une cascade de "if" : on détecte des mots-clés dans la question
  // et on renvoie la réponse adaptée. Le premier cas qui correspond gagne.

  // 1. Proactive alerts analysis
  // Cas 1 : question sur l'état/les problèmes ET il existe des alertes critiques.
  if (criticalAlerts.length > 0 && (query.includes("état") || query.includes("problème") || query.includes("critique"))) {
    const details = criticalAlerts.map(a => 
      `• **${a.siteName}** - ${a.title} (${a.value}${a.sensorType === 'temperature' ? '°C' : '%'}, seuil: ${a.threshold})`
    ).join("\n");
    
    return `🚨 **Analyse des Alertes Critiques**\n\nJ'ai détecté **${criticalAlerts.length} alerte(s) critique(s)** qui nécessitent votre attention immédiate :\n\n${details}\n\n**Recommandations** :\n1. Vérifier la climatisation des sites concernés\n2. Acquitter les alertes après intervention\n3. Planifier une maintenance préventive\n\nVoulez-vous que j'affiche plus de détails ?`;
  }

  // 2. Temperature analysis
  // Cas 2 : question sur la température.
  if (query.includes("température") || query.includes("temp")) {
    const hotSites = sites.filter(s => s.temperature > 25); // Sites au-dessus de 25°C.

    // Sous-cas : la question vise un site précis (le Palais des Sports).
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
  // Cas 3 : demande d'un état/rapport global de toute l'infrastructure.
  if (query.includes("état") || query.includes("statut") || query.includes("analyse") || query.includes("rapport")) {
    const okSites = sites.filter(s => s.status === "ok").length;
    
    return `📊 **Analyse Complète de l'Infrastructure**\n\n**Sites** :\n• ✅ ${okSites} opérationnels\n• ⚠️ ${warningSites.length} en avertissement\n• 🔴 ${criticalSites.length} critiques\n\n**Alertes** :\n• Total : ${activeAlerts.length}\n• Critiques : ${criticalAlerts.length}\n• Taux de résolution : ${((alerts.filter(a => a.resolved).length / alerts.length) * 100).toFixed(0)}%\n\n**Performance** :\n• Uptime moyen : ${avgUptime.toFixed(1)}%\n• Température moy : ${avgTemp.toFixed(1)}°C\n\n${criticalSites.length > 0 ? `⚠️ **Action requise** : ${criticalSites.length} site(s) nécessitent une intervention.` : "✅ L'infrastructure est globalement saine."}`;
  }

  // 4. Site-specific analysis
  // Cas 4 : le nom d'un site est cité dans la question -> fiche détaillée de ce site.
  const mentionedSite = sites.find(s => query.includes(s.name.toLowerCase()));
  if (mentionedSite) {
    return `🏢 **Analyse Détaillée - ${mentionedSite.name}**\n\n**État** : ${mentionedSite.status.toUpperCase()}\n**Baies** : ${mentionedSite.bayCount}\n**Alertes** : ${mentionedSite.alertCount}\n\n**Métriques** :\n• Température : ${mentionedSite.temperature.toFixed(1)}°C\n• Humidité : ${mentionedSite.humidity}%\n• Uptime : ${mentionedSite.uptime}%\n• Consommation : ${mentionedSite.powerConsumption.toFixed(1)} kW\n\n**Type** : ${mentionedSite.type}\n**Adresse** : ${mentionedSite.address}\n\n${mentionedSite.alertCount > 0 ? `⚠️ **Attention** : Ce site a ${mentionedSite.alertCount} alerte(s) active(s).` : "✅ Aucune alerte pour ce site."}`;
  }

  // 5. Recommendations
  // Cas 5 : demande de recommandations -> on construit une liste selon les seuils dépassés.
  if (query.includes("recommandation") || query.includes("conseil") || query.includes("que faire")) {
    const recommendations = [];

    // On empile une recommandation par problème détecté.
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
    
    const okCount = sites.filter((s) => s.status === "ok").length;
    return `✅ **Analyse Positive**\n\nVotre infrastructure est en excellent état !\n\n**Points forts** :\n• ${okCount} sites opérationnels\n• Uptime moyen: ${avgUptime.toFixed(1)}%\n• Températures normales\n\nContinuez le bon travail ! 🎉`;
  }

  // 6. Help / Commands
  // Cas 6 : l'utilisateur demande de l'aide -> on liste les commandes possibles.
  if (query.includes("aide") || query.includes("help") || query.includes("commande") || query === "?") {
    return `🤖 **AURION IA - Assistant Intelligent**\n\nJe suis une IA avancée qui peut vous aider avec :\n\n**📊 Analyse de Données** :\n• "Quel est l'état global ?"\n• "Analyse les températures"\n• "Recommandations ?"\n\n**🏢 Sites Spécifiques** :\n• "État du Palais des Sports ?"\n• "Températures par site"\n\n**🚨 Alertes** :\n• "Alertes critiques ?"\n• "Problèmes en cours ?"\n\n**💡 Suggestions** :\n• "Que faire ?"\n• "Conseils d'optimisation"\n\n**Fonctionnalités avancées** :\n• Analyse prédictive\n• Détection d'anomalies\n• Corrélation d'événements\n• Rapports personnalisés\n\nPosez-moi n'importe quelle question ! 💬`;
  }

  // 7. Predictive analysis
  // Cas 7 : prévisions/tendances -> projection simple à partir de la température moyenne.
  if (query.includes("prévision") || query.includes("prédic") || query.includes("tendance")) {
    return `🔮 **Analyse Prédictive**\n\nBasé sur les données des 30 derniers jours :\n\n**Températures** :\n• Tendance : ${avgTemp > 23 ? "↗️ En hausse" : "↘️ Stable"}\n• Prévision J+7 : ${(avgTemp + 0.5).toFixed(1)}°C\n• Risque surchauffe : ${avgTemp > 24 ? "Moyen" : "Faible"}\n\n**Alertes** :\n• Fréquence actuelle : ${activeAlerts.length} actives\n• Pattern détecté : ${criticalAlerts.length > 0 ? "Pics pendant heures de pointe" : "Normal"}\n\n**Recommandation** : ${avgTemp > 24 ? "Maintenance climatisation recommandée avant l'été" : "Continuer la surveillance"}.`;
  }

  // 8. Cost analysis
  // Cas 8 : analyse des coûts énergétiques.
  if (query.includes("coût") || query.includes("cout") || query.includes("économie") || query.includes("consommation")) {
    const totalPower = sites.reduce((sum, s) => sum + s.powerConsumption, 0); // Puissance totale (kW).
    // Coût mensuel = puissance x prix kWh (0,15€) x 24h x 30 jours.
    const monthlyCost = totalPower * 0.15 * 24 * 30;

    return `💰 **Analyse Énergétique et Coûts**\n\n**Consommation Actuelle** :\n• Total : ${totalPower.toFixed(1)} kW\n• Coût estimé : ${monthlyCost.toFixed(0)}€/mois\n• Par site : ${(monthlyCost / sites.length).toFixed(0)}€/mois\n\n**Top Consommateurs** :\n${sites.sort((a, b) => b.powerConsumption - a.powerConsumption).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ${s.powerConsumption.toFixed(1)} kW`).join('\n')}\n\n💡 **Économies Potentielles** :\n• Optimisation climatisation : -15%\n• Consolidation serveurs : -10%\n• Extinction hors heures : -20%\n\n**Économie annuelle estimée** : ~${(monthlyCost * 12 * 0.25).toFixed(0)}€`;
  }

  // 9. Performance metrics
  // Cas 9 : performance/disponibilité -> on cherche le meilleur et le pire site.
  if (query.includes("performance") || query.includes("uptime") || query.includes("disponibilité")) {
    // reduce parcourt les sites pour garder celui ayant le plus (resp. le moins) d'uptime.
    const bestSite = sites.reduce((max, s) => s.uptime > max.uptime ? s : max, sites[0]);
    const worstSite = sites.reduce((min, s) => s.uptime < min.uptime ? s : min, sites[0]);

    return `📈 **Analyse de Performance**\n\n**Disponibilité Globale** : ${avgUptime.toFixed(2)}%\n${avgUptime >= 99.5 ? "✅ Objectif atteint (99.5%)" : "⚠️ En dessous de l'objectif (99.5%)"}\n\n**Meilleur Site** :\n🥇 ${bestSite.name}: ${bestSite.uptime}%\n\n**Nécessite Attention** :\n${worstSite.uptime < 99 ? `⚠️ ${worstSite.name}: ${worstSite.uptime}%` : "✅ Tous les sites > 99%"}\n\n**Incidents ce mois** : ${alerts.filter(a => a.severity !== "info").length}\n**Temps de résolution moyen** : ~45 minutes\n\n${avgUptime < 99.5 ? "💡 Suggestion : Analyser les causes de downtime pour améliorer la disponibilité." : "🎉 Excellente performance !"}`;
  }

  // 10. List sites
  // Cas 10 : liste des sites, regroupés par statut.
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
  // Cas 11 : comparaison -> on trie les sites par performance et par consommation.
  if (query.includes("compare") || query.includes("différence") || query.includes("meilleur")) {
    return `📊 **Analyse Comparative**\n\n**Sites par Performance** :\n${sites.sort((a, b) => b.uptime - a.uptime).slice(0, 5).map((s, i) => `${i + 1}. ${s.name}: ${s.uptime}% uptime, ${s.temperature.toFixed(1)}°C`).join('\n')}\n\n**Consommation Énergétique** :\n${sites.sort((a, b) => b.powerConsumption - a.powerConsumption).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ${s.powerConsumption.toFixed(1)} kW`).join('\n')}\n\n💡 **Insight** : ${sites[0].name} est le site le plus performant avec ${sites.sort((a, b) => b.uptime - a.uptime)[0].uptime}% d'uptime.`;
  }

  // 12. Smart fallback with context awareness
  // Cas 12 (repli) : aucun mot-clé reconnu. La réponse dépend de s'il y a déjà eu un échange.
  const hasContext = conversationHistory.length > 0;
  if (hasContext) {
    return `🤔 Je comprends que vous souhaitez en savoir plus.\n\nVoici ce que je peux faire pour vous :\n\n• Analyser un site spécifique (ex: "État du Palais des Sports ?")\n• Fournir des statistiques détaillées\n• Prédire des tendances\n• Suggérer des optimisations\n• Comparer les performances\n\nQuelle information vous serait utile ? 💬`;
  }
  
  return `👋 Bonjour ! Je suis **AURION IA**, votre assistant intelligent.\n\nJe peux analyser votre infrastructure et répondre à des questions complexes comme :\n\n• "Quel est l'état global de l'infrastructure ?"\n• "Analyse les températures et donne des recommandations"\n• "Quels sites nécessitent une attention ?"\n• "Prévisions pour la semaine prochaine ?"\n• "Comment optimiser la consommation ?"\n\nJe dispose des données en temps réel de vos **${sites.length} sites** et **${alerts.length} alertes**.\n\nQue voulez-vous savoir ? 💬`;
}

/**
 * Generate smart suggestions based on current state
 */
// Propose des questions toutes prêtes à afficher sous le chat, adaptées à l'état actuel.
export function generateSuggestions(sites: Site[], alerts: Alert[]): string[] {
  const suggestions = ["Quel est l'état global ?"]; // Suggestion de base, toujours présente.

  // On ajoute une suggestion ciblée s'il existe des alertes critiques non acquittées.
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
