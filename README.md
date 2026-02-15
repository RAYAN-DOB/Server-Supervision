# 🚀 AURION - Système de Supervision Maisons-Alfort

![AURION Banner](https://img.shields.io/badge/AURION-Supervision-6A00FF?style=for-the-badge&logo=data:image/svg+xml;base64,...)

**AURION** est une application web moderne de supervision et monitoring des infrastructures IT de la Ville de Maisons-Alfort. Développée dans le cadre d'un projet BTS CIEL, elle permet la surveillance en temps réel de 12 sites municipaux équipés de capteurs BlackBox ServSensor Plus, intégrés à Zabbix.

---

## ✨ Fonctionnalités

### 🎯 Principales

- **Dashboard Temps Réel** : Vue d'ensemble instantanée de tous les sites
- **Carte Interactive** : Visualisation géographique des 12 sites de Maisons-Alfort
- **Alertes Intelligentes** : Système de notification multi-niveaux (critique, majeure, mineure, info)
- **Analytics Avancés** : Graphiques, tendances, prévisions et rapports automatiques
- **Agent IA Intégré (MA-IA)** : Chatbot intelligent pour interroger le système en langage naturel
- **Interface Responsive** : Design adaptatif pour desktop, tablette et mobile

### 🔬 Supervision Capteurs

Chaque baie serveur est équipée de capteurs surveillant :
- 🌡️ Température (seuils configurables)
- 💧 Humidité relative
- 🔥 Détection de fumée
- 💦 Détection d'eau
- 🚪 Ouverture de porte
- 📳 Vibrations
- ⚡ Alimentation 230V
- 💨 Flux d'air
- 🌫️ Pression différentielle

### 🗺️ Sites Supervisés

1. Hôtel de Ville
2. Palais des Sports
3. Centre Technique Municipal
4. Médiathèque Abbé Grégoire
5. École Jean Moulin
6. École Victor Hugo
7. École Jules Ferry
8. Conservatoire
9. Police Municipale
10. Centre de Secours
11. Marché d'Intérêt National
12. Maison des Associations

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **TailwindCSS** + Design System "Nebula"
- **Framer Motion** (animations)
- **Recharts** + **Tremor** (graphiques)

### State Management
- **Zustand** (avec persistance)
- **React Query** (server state)

### Backend / API
- **Next.js API Routes**
- **Zabbix API** (intégration prête)
- Routes mock pour développement

### Design System "Nebula"
- Palette : Violet (`#6A00FF`), Magenta (`#C300FF`), Cyan (`#00F0FF`)
- Glassmorphism + Neon Glow
- Animations fluides
- Mode sombre par défaut

---

## 🚀 Installation

### Prérequis
- Node.js 20+
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/maisons-alfort/aurion.git
cd aurion

# 2. Installer les dépendances
npm install

# 3. Copier le fichier .env.example
cp .env.example .env

# 4. Configurer les variables d'environnement (optionnel pour le dev)
# Éditer .env avec vos paramètres Zabbix

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 📁 Structure du Projet

```
aurion/
├── app/                      # Pages Next.js (App Router)
│   ├── page.tsx             # Page d'accueil
│   ├── dashboard/           # Dashboard principal
│   ├── sites/               # Liste et détails des sites
│   ├── alertes/             # Centre d'alertes
│   ├── carte/               # Vue cartographique
│   ├── analytics/           # Analytics et rapports
│   ├── admin/               # Administration
│   └── api/                 # API Routes
│       └── zabbix/          # Endpoints Zabbix
├── components/              # Composants React
│   ├── ui/                  # Composants UI de base
│   ├── navbar.tsx           # Navigation
│   ├── ai-chatbot.tsx       # Agent IA MA-IA
│   └── providers.tsx        # Context providers
├── lib/                     # Utilitaires
│   ├── utils.ts             # Helpers généraux
│   └── zabbix/              # Client Zabbix
├── store/                   # Zustand store
├── data/                    # Mock data
├── types/                   # Types TypeScript
├── public/                  # Assets statiques
└── tailwind.config.ts       # Configuration Tailwind
```

---

## 🎨 Design System "Nebula"

### Couleurs Principales
```css
--nebula-violet: #6A00FF
--nebula-magenta: #C300FF
--nebula-cyan: #00F0FF
--nebula-space: #050510
```

### Composants Clés
- **Glass Card** : `glass-card` (glassmorphism + backdrop blur)
- **Neon Button** : `btn-neon` (gradient + glow effect)
- **Sensor Gauge** : Jauges circulaires animées
- **Gradient Text** : `gradient-text` (texte dégradé)

---

## 🔌 Intégration Zabbix

### Configuration

Dans `.env` :
```env
ZABBIX_API_URL=http://votre-zabbix/api_jsonrpc.php
ZABBIX_API_TOKEN=votre_token_ici
```

### Endpoints API

- `GET /api/zabbix/status` : Statut de connexion
- `GET /api/zabbix/hosts` : Liste des hôtes
- `GET /api/zabbix/triggers` : Triggers actifs
- `POST /api/zabbix/acknowledge` : Acquitter une alerte

### Client Zabbix

```typescript
import { ZabbixClient } from '@/lib/zabbix/client';

const client = new ZabbixClient({
  apiUrl: process.env.ZABBIX_API_URL!,
  apiToken: process.env.ZABBIX_API_TOKEN,
});

await client.authenticate();
const hosts = await client.getHosts();
```

---

## 🤖 Agent IA (MA-IA)

L'assistant intelligent comprend les requêtes en langage naturel :

**Exemples de questions :**
- "Quelle est la température au Palais des Sports ?"
- "Y a-t-il des alertes critiques ?"
- "Combien de sites sont surveillés ?"
- "Quel est l'état global ?"

Le chatbot utilise un système NLP simple basé sur la correspondance de motifs.

---

## 📊 Données Mock (Développement)

En l'absence de Zabbix, l'application utilise des données simulées réalistes :
- Variation sinusoïdale de la température
- Génération dynamique d'alertes
- Corrélations logiques (ex: porte ouverte → température ↑)

Fichiers : `data/mock-sites.ts`

---

## 🧪 Scripts Disponibles

```bash
npm run dev          # Serveur de développement (Turbopack)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
```

---

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker

```dockerfile
# Dockerfile disponible sur demande
```

---

## 📝 Projet BTS CIEL

### Contexte
Projet E6 - Développement d'une application IoT pour la DSI de Maisons-Alfort.

### Objectifs
- Supervision temps réel des salles serveurs
- Prévention des incidents (surchauffe, fumée, inondation)
- Alertes proactives
- Interface moderne et ergonomique

### Technologies Apprises
- Next.js / React avancé
- Intégration API (Zabbix)
- Design Systems
- Monitoring IoT
- TypeScript strict

---

## 🤝 Contribution

Les contributions sont les bienvenues ! (après l'examen 😉)

---

## 📄 Licence

Ce projet est développé dans un cadre éducatif (BTS CIEL).  
© 2026 - Ville de Maisons-Alfort - Direction des Systèmes d'Information

---

## 📞 Contact

**Développeur** : Rayan  
**Projet** : BTS CIEL - Session 2026  
**Encadrement** : DSI Maisons-Alfort

---

## 🎯 Roadmap Future

- [ ] Intégration Zabbix réelle
- [ ] Notifications push (SMS, Email, Slack)
- [ ] Module de maintenance planifiée
- [ ] Export PDF/Excel avancé
- [ ] Dashboard 3D avec Three.js
- [ ] Scan QR Code pour techniciens terrain
- [ ] Gamification (badges techniciens)

---

**Fait avec ❤️ pour Maisons-Alfort** 🇫🇷
