# 🚀 Déploiement Vercel - Configuration

## ✅ Configuration Node.js

Ce projet utilise **Node.js 20** pour le déploiement Vercel.

### Fichiers de Configuration

1. **`.node-version`** → Spécifie Node.js 20 pour Vercel
2. **`.nvmrc`** → Spécifie Node.js 20.11.0 pour le développement local
3. **`vercel.json`** → Configuration explicite du build

### Pourquoi ces changements ?

❌ **Problème Initial** :
```json
"engines": { "node": ">=20.0.0" }
```
→ Causait des warnings et erreurs internes sur Vercel

✅ **Solution Finale** :
- Suppression de la section `engines` du `package.json`
- Utilisation de `.node-version` à la place
- Configuration explicite dans `vercel.json`

## 🔧 Configuration Vercel

### Paramètres Recommandés dans le Dashboard Vercel

1. **Build Command** : `npm run build` (automatique via vercel.json)
2. **Output Directory** : `.next` (automatique via vercel.json)
3. **Install Command** : `npm install` (automatique)
4. **Node.js Version** : 20.x (automatique via .node-version)

### Variables d'Environnement (si nécessaire)

Ajoutez dans le Dashboard Vercel → Settings → Environment Variables :

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://votre-api.com
```

## 🎯 Déploiement

Le déploiement est automatique à chaque push sur la branche `master` :

```bash
git add .
git commit -m "Update"
git push origin master
```

Vercel détecte automatiquement et redéploie en ~2-3 minutes.

## 📊 Logs de Build Attendus

✅ **Build Réussi** :
```
Using Node.js 20.x
Installing dependencies...
Running "npm run build"...
Build completed successfully
Deployment Ready!
```

❌ **Erreurs à Éviter** :
- ⚠️ Warning sur "engines"
- ❌ Internal error
- ❌ Node version mismatch

## 🔍 Troubleshooting

### Si le déploiement échoue :

1. **Vérifier les logs** dans le Dashboard Vercel
2. **Clear Cache** : Settings → General → Clear Build Cache
3. **Redeploy** : Deployments → ⋯ → Redeploy

### Si le warning "engines" persiste :

1. Vérifier que `package.json` n'a **PAS** de section `engines`
2. Vérifier que `.node-version` contient `20`
3. Force redeploy après avoir vidé le cache

## 📝 Commandes Utiles

```bash
# Développement local
npm run dev

# Build local (pour tester)
npm run build

# Vérifier la version Node
node --version

# Push vers GitHub (trigger Vercel)
git push origin master
```

## ✨ Statut Actuel

- ✅ Node.js : Version 20.x
- ✅ Framework : Next.js 15.1.0
- ✅ Déploiement : Automatique via GitHub
- ✅ Cache : Optimisé
- ✅ Warnings : Aucun

---

**Dernière mise à jour** : Mars 2026  
**Maintenu par** : RAYAN-DOB
