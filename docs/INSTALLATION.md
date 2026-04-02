# 📦 Guide d'Installation AURION

## 🎯 Installation Rapide (5 minutes)

### Étape 1 : Vérifier les prérequis

Ouvrez PowerShell et vérifiez vos versions :

```powershell
node --version   # Doit être >= 20.0.0
npm --version    # Doit être >= 10.0.0
```

Si Node.js n'est pas installé ou est trop ancien :
👉 Téléchargez depuis https://nodejs.org (version LTS recommandée)

---

### Étape 2 : Installer les dépendances

Dans le dossier du projet, exécutez :

```powershell
npm install
```

⏱️ Temps estimé : 2-3 minutes

---

### Étape 3 : Configuration (optionnel pour le dev)

```powershell
# Copier le fichier d'environnement
copy .env.example .env

# Éditer .env (facultatif)
notepad .env
```

**Pour le développement**, vous pouvez laisser les valeurs par défaut. L'application fonctionnera avec des données mockées.

---

### Étape 4 : Lancer l'application

```powershell
npm run dev
```

✅ L'application démarre sur **http://localhost:3000**

---

## 🎨 Première Utilisation

1. **Page d'accueil** : http://localhost:3000
   - Cliquez sur "Accéder au Dashboard"

2. **Explorer les fonctionnalités** :
   - 📊 Dashboard : Vue d'ensemble
   - 🏢 Sites : Liste des 12 sites
   - 🗺️ Carte : Vue géographique
   - 🚨 Alertes : Centre d'alertes
   - 📈 Analytics : Graphiques et rapports
   - ⚙️ Admin : Configuration

3. **Tester l'Agent IA** :
   - Cliquez sur le bouton violet en bas à droite
   - Essayez : "Quelle est la température au Palais des Sports ?"

---

## 🛠️ Commandes Utiles

```powershell
# Développement avec hot-reload
npm run dev

# Vérification TypeScript
npm run type-check

# Linter ESLint
npm run lint

# Build production
npm run build

# Lancer en production
npm run start
```

---

## 🐛 Dépannage

### Erreur : "Cannot find module..."
```powershell
# Supprimer node_modules et réinstaller
rmdir /s /q node_modules
npm install
```

### Port 3000 déjà utilisé
```powershell
# Utiliser un autre port
$env:PORT=3001
npm run dev
```

### Erreur de compilation Tailwind
```powershell
# Nettoyer le cache Next.js
rmdir /s /q .next
npm run dev
```

---

## 📁 Structure Après Installation

```
supervision serveur/
├── node_modules/        ✅ Dépendances installées
├── .next/              ✅ Build Next.js (après 1er lancement)
├── app/                📄 Pages de l'application
├── components/         🧩 Composants React
├── lib/                🛠️ Utilitaires
├── store/              💾 État global
├── data/               📊 Données mockées
├── public/             🖼️ Assets statiques
├── package.json        📦 Configuration npm
├── tailwind.config.ts  🎨 Configuration Tailwind
└── tsconfig.json       ⚙️ Configuration TypeScript
```

---

## 🚀 Passer en Production

### Option 1 : Vercel (Gratuit, Recommandé)

```powershell
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

### Option 2 : Build Local

```powershell
npm run build
npm run start
```

L'application sera sur **http://localhost:3000** en mode production.

---

## 🔌 Connexion Zabbix Réel

### Configuration

1. Éditez `.env` :
```env
ZABBIX_API_URL=http://votre-serveur-zabbix/api_jsonrpc.php
ZABBIX_API_TOKEN=votre_token_api
```

2. Dans l'application, allez dans **Admin** :
   - Entrez l'URL de votre API Zabbix
   - Entrez votre token
   - Cliquez sur "Tester" puis "Sauvegarder"

3. Les données réelles remplaceront automatiquement les données mockées !

---

## 📞 Support

**Problème d'installation ?**
- Vérifiez la version de Node.js
- Supprimez `node_modules` et `.next`
- Réinstallez avec `npm install`

**Tout fonctionne ?**
🎉 Bravo ! Vous êtes prêt à impressionner l'examinateur BTS !

---

**Temps total d'installation** : ~5 minutes  
**Temps de premier lancement** : ~30 secondes

✅ Installation terminée !
