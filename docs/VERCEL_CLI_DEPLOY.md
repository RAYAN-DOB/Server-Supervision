# Instructions pour Déploiement Vercel CLI

## Si le déploiement automatique échoue toujours

Vous pouvez déployer manuellement depuis votre machine :

1. Installer Vercel CLI :
```bash
npm install -g vercel
```

2. Se connecter à Vercel :
```bash
vercel login
```

3. Déployer le projet :
```bash
vercel --prod
```

Cette méthode contourne les problèmes de région et de cache.

## Avantages
- Déploiement direct depuis votre machine
- Choix de la région au moment du déploiement
- Contourne les problèmes d'infrastructure GitHub → Vercel

## Commandes utiles
```bash
# Déploiement de production
vercel --prod

# Déploiement de prévisualisation
vercel

# Voir les logs
vercel logs

# Lister les déploiements
vercel ls
```
