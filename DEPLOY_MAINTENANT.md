# 🚀 Guide de Déploiement Manuel avec Vercel CLI

## Étapes à Suivre (Simple et Rapide)

### 1. Ouvrez un Terminal PowerShell

### 2. Naviguez vers votre projet
```powershell
cd "C:\Users\rdob2\Documents\projet cursor\Server-Supervision-main\Server-Supervision-main"
```

### 3. Connectez-vous à Vercel
```powershell
vercel login
```
→ Cela ouvrira votre navigateur
→ Cliquez sur "Confirm" pour autoriser

### 4. Déployez en Production
```powershell
vercel --prod
```

### 5. Suivez les Instructions
Vercel va poser quelques questions :
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Choisissez votre compte
- **Link to existing project?** → `Y` (Yes)
- **What's the name?** → `Server-Supervision`
- **Override settings?** → `N` (No)

### 6. Attendez le Déploiement
Le déploiement prendra ~2-3 minutes et vous donnera une URL.

---

## ✨ Avantages de cette Méthode

✅ **Contourne le problème GitHub → Vercel**
✅ **Déploiement direct** depuis votre machine
✅ **Pas d'erreur de région** (vous choisissez)
✅ **Plus rapide** (pas besoin de clone GitHub)

---

## 🆘 Si vous avez des Questions

Copiez-collez exactement ces commandes :

```powershell
# 1. Aller dans le dossier
cd "C:\Users\rdob2\Documents\projet cursor\Server-Supervision-main\Server-Supervision-main"

# 2. Se connecter à Vercel (ouvre le navigateur)
vercel login

# 3. Déployer en production
vercel --prod
```

---

## 📝 Résultat Attendu

À la fin, vous verrez :
```
✅ Production: https://server-supervision-xxxx.vercel.app
```

**Cette URL sera votre site en ligne !** 🎉

---

## ⚡ Commandes Alternatives

Si `vercel --prod` demande trop d'infos :

```powershell
# Déploiement rapide sans questions
vercel --prod --yes

# Ou spécifier le nom du projet
vercel --prod --name=Server-Supervision
```
