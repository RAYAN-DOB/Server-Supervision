# 🌟 AURION - Système de Supervision Intelligent

> Plateforme de supervision et monitoring des infrastructures IT de la Ville de Maisons-Alfort

[![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://app.netlify.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🚀 Accès Rapide

### 🌐 Site en Ligne
**URL** : Votre site est déployé sur Netlify !

### 🔐 Connexion (Mode Démo)
Utilisez **n'importe quel email/mot de passe** pour vous connecter :

- **Super Admin** : `admin@maisons-alfort.fr` / n'importe quel mot de passe
- **Admin** : `admin@exemple.fr` / n'importe quel mot de passe
- **Technicien** : `tech@exemple.fr` / n'importe quel mot de passe
- **Viewer** : `user@exemple.fr` / n'importe quel mot de passe

---

## ✨ Fonctionnalités

### 📊 Dashboard Interactif
- Vue d'ensemble en temps réel
- Statistiques KPI
- Graphiques de température et performance
- Alertes actives

### 🏢 Gestion des Sites
- **12 sites municipaux** surveillés
- Cartographie interactive
- Détails par site et par baie
- Capteurs en temps réel

### 🚨 Centre d'Alertes
- Alertes critiques, majeures, mineures
- Système d'acquittement
- Filtres avancés
- Notifications temps réel

### 🗺️ Carte Interactive
- Géolocalisation des sites
- Marqueurs avec statut en temps réel
- Vue d'ensemble géographique

### 📈 Analytics
- Tableaux de bord personnalisables
- Historique des événements
- Rapports exportables
- Prédictions IA

### 🤖 AURION IA
- Assistant conversationnel intelligent
- Analyse prédictive
- Recommandations automatiques
- Support 24/7

---

## 🛠️ Technologies

### Frontend
- **Next.js 15.5** - Framework React
- **TypeScript 5.7** - Typage fort
- **Tailwind CSS 3.4** - Styling moderne
- **Framer Motion 11** - Animations fluides

### State Management
- **Zustand 5.0** - State global
- **React Query 5.6** - Gestion données serveur

### UI Components
- **Radix UI** - Composants accessibles
- **Lucide React** - Icônes modernes
- **Recharts** - Graphiques interactifs
- **React Leaflet** - Cartographie

### Backend (API Routes)
- **Next.js API Routes**
- **Zabbix Client** (prêt pour intégration)

---

## 📦 Installation Locale

```bash
# 1. Cloner le projet
git clone https://github.com/RAYAN-DOB/Server-Supervision.git
cd Server-Supervision

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev      # Développement avec Turbo
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Linter ESLint
npm run type-check  # Vérification TypeScript
```

---

## 🎨 Design System

### Couleurs Principales
- **Violet Nebula** : `#6A00FF`
- **Magenta** : `#C300FF`
- **Cyan** : `#00F0FF`
- **Pink** : `#FF00E5`

### Typographie
- **Corps** : Inter (Google Fonts)
- **Titres** : Space Grotesk (Google Fonts)

### Animations
- Framer Motion pour transitions fluides
- Micro-interactions sur tous les éléments
- Fond cosmique animé

---

## 🔧 Configuration

### Variables d'Environnement (Optionnel)

Créez un fichier `.env.local` :

```env
# API Zabbix (si connexion réelle)
NEXT_PUBLIC_ZABBIX_URL=https://votre-zabbix.com
ZABBIX_API_TOKEN=votre-token

# Autres
NEXT_PUBLIC_API_URL=https://votre-api.com
```

---

## 📱 Pages Disponibles

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Landing page publique |
| Connexion | `/login` | Authentification |
| Dashboard | `/dashboard` | Vue d'ensemble |
| Sites | `/sites` | Liste des sites |
| Détails Site | `/sites/[id]` | Détails + baies |
| Détails Baie | `/sites/[id]/baies/[baieId]` | Capteurs détaillés |
| Carte | `/carte` | Carte interactive |
| Alertes | `/alertes` | Centre d'alertes |
| Historique | `/historique` | Journal des événements |
| Analytics | `/analytics` | Tableaux de bord |
| Rapports | `/rapports` | Génération rapports |
| Admin | `/admin` | Gestion utilisateurs |

---

## 🎯 Fonctionnalités Avancées

### ⌨️ Raccourcis Clavier
- `Ctrl + K` : Palette de commandes
- `Shift + ?` : Aide raccourcis
- `G + D` : Dashboard
- `G + S` : Sites
- `G + A` : Alertes
- `G + M` : Carte
- `ESC` : Fermer modales

### 🎨 Easter Eggs
- Code Konami : `↑ ↑ ↓ ↓ ← → ← → B A`
- Mode Performance : `Ctrl + Shift + P`

### 🤖 Commandes IA
- "Quel est l'état global ?"
- "Analyse les températures"
- "Alertes critiques ?"
- "Recommandations ?"
- "Prévisions pour la semaine"

---

## 📊 Données (Mode Démo)

L'application fonctionne avec **données simulées** :
- 12 sites municipaux réels de Maisons-Alfort
- Coordonnées GPS réelles
- Données de capteurs générées dynamiquement
- Alertes simulées

### Intégration Zabbix (Production)

Le client Zabbix est prêt dans `/lib/zabbix/client.ts` pour une intégration réelle.

---

## 🔐 Sécurité

- Authentification simulée (remplacer par NextAuth en production)
- Cookies sécurisés avec SameSite
- Middleware de protection des routes
- Validation TypeScript stricte
- Protection CSRF

---

## 🚀 Déploiement

### Netlify (Actuel)
```bash
# Automatique via GitHub
git push origin main
```

### Vercel (Alternative)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t aurion-supervision .
docker run -p 3000:3000 aurion-supervision
```

---

## 📝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 🐛 Problèmes Connus

### ✅ Résolu
- ~~Erreur déploiement Vercel~~ → Migré vers Netlify
- ~~Warning Node.js version~~ → Configuration corrigée

### ⏳ En Cours
- Intégration Zabbix réelle (en attente configuration serveur)
- Mode hors ligne avec Service Worker

---

## 📄 Licence

Propriété de la Ville de Maisons-Alfort - DSI

---

## 👥 Équipe

**Développeur Principal** : RAYAN-DOB  
**Client** : Ville de Maisons-Alfort  
**Département** : DSI (Direction des Systèmes d'Information)

---

## 📞 Support

- **GitHub Issues** : [Créer une issue](https://github.com/RAYAN-DOB/Server-Supervision/issues)
- **Email** : dsi@maisons-alfort.fr

---

## 🎉 Remerciements

- Next.js Team
- Vercel / Netlify
- Communauté Open Source
- Ville de Maisons-Alfort

---

**Fait avec ❤️ pour la supervision IT de Maisons-Alfort** 🚀
