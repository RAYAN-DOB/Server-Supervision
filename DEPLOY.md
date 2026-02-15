# 🚀 Guide de Déploiement AURION

## Déploiement sur Vercel (Recommandé - GRATUIT)

### Pourquoi Vercel ?
- ✅ Gratuit pour projets personnels
- ✅ SSL automatique (HTTPS)
- ✅ CDN global ultra-rapide
- ✅ Déploiement automatique depuis Git
- ✅ Domaine personnalisé gratuit
- ✅ Analytics intégrés
- ✅ Logs en temps réel

### 🎯 Méthode 1 : Deploy depuis l'interface Web (Plus Simple)

1. **Créer un compte Vercel**
   - Va sur https://vercel.com
   - Inscris-toi avec GitHub/GitLab/BitBucket

2. **Créer un repository Git**
   ```powershell
   # Dans ton dossier projet
   git init
   git add .
   git commit -m "Initial commit - AURION v2.0"
   ```

3. **Push sur GitHub**
   ```powershell
   # Crée un repo sur github.com
   git remote add origin https://github.com/ton-username/aurion.git
   git push -u origin main
   ```

4. **Importer dans Vercel**
   - Dans Vercel, clique "New Project"
   - Sélectionne ton repo GitHub
   - Vercel détecte automatiquement Next.js
   - Clique "Deploy"

5. **✅ C'est déployé !**
   - URL: `https://aurion-xxx.vercel.app`
   - Certificat SSL automatique
   - Déploiement automatique à chaque push

---

### 🎯 Méthode 2 : Deploy avec Vercel CLI (Rapide)

```powershell
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer (depuis le dossier du projet)
vercel

# Suivre les instructions :
# - Project name: aurion
# - Framework: Next.js (auto-détecté)
# - Settings: accepter les defaults

# 4. Pour déployer en production
vercel --prod
```

**Résultat** : Application en ligne en 2 minutes ! 🎉

---

## Configuration Avancée

### Variables d'Environnement sur Vercel

1. **Dans Vercel Dashboard** :
   - Project Settings → Environment Variables
   - Ajouter :
     ```
     ZABBIX_API_URL=http://votre-zabbix/api_jsonrpc.php
     ZABBIX_API_TOKEN=votre_token_ici
     NEXT_PUBLIC_APP_NAME=AURION
     ```

2. **Re-déployer** :
   ```powershell
   vercel --prod
   ```

---

### Domaine Personnalisé

1. **Dans Vercel** :
   - Project Settings → Domains
   - Ajouter : `supervision.maisons-alfort.fr` (exemple)

2. **Configurer DNS** :
   - Type : CNAME
   - Name : supervision
   - Value : cname.vercel-dns.com

3. **SSL automatique** : Vercel configure HTTPS

---

## Déploiement sur Serveur Linux (Production DSI)

### Prérequis
- Node.js 20+
- PM2 (process manager)
- Nginx (reverse proxy)

### 📦 Build & Deploy

```bash
# 1. Build production
npm run build

# 2. Installer PM2
npm install -g pm2

# 3. Créer ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'aurion',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 4. Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Vérifier
pm2 status
pm2 logs aurion
```

### 🌐 Nginx Configuration

```nginx
# /etc/nginx/sites-available/aurion
server {
    listen 80;
    server_name supervision.maisons-alfort.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/aurion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL avec Let's Encrypt
sudo certbot --nginx -d supervision.maisons-alfort.fr
```

---

## Déploiement avec Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  aurion:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ZABBIX_API_URL=http://zabbix:10051/api_jsonrpc.php
      - ZABBIX_API_TOKEN=${ZABBIX_API_TOKEN}
    restart: unless-stopped
```

### Commandes Docker

```bash
# Build
docker build -t aurion .

# Run
docker run -p 3000:3000 aurion

# Avec Docker Compose
docker-compose up -d

# Logs
docker-compose logs -f
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# Métriques en temps réel
pm2 monit

# Dashboard web
pm2 plus

# Logs
pm2 logs aurion --lines 100

# Redémarrer
pm2 restart aurion

# Mettre à jour
git pull
npm install
npm run build
pm2 restart aurion
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Performance

### Optimisations Next.js

```javascript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Cache Headers (Nginx)

```nginx
location /_next/static {
    alias /app/.next/static;
    expires 1y;
    access_log off;
}

location /static {
    alias /app/public;
    expires 1y;
    access_log off;
}
```

---

## Sécurité

### Headers de Sécurité (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Rate Limiting (Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
}
```

---

## Rollback

### Vercel
```powershell
# Lister les déploiements
vercel ls

# Rollback vers un déploiement précédent
vercel rollback <deployment-url>
```

### PM2
```bash
# Sauvegarder version actuelle
cp -r .next .next.backup

# Restaurer
rm -rf .next
mv .next.backup .next
pm2 restart aurion
```

---

## Checklist Avant Production

- [ ] Variables d'environnement configurées
- [ ] Build production réussi (`npm run build`)
- [ ] Tests manuels effectués
- [ ] SSL/HTTPS configuré
- [ ] Domaine configuré
- [ ] Monitoring en place
- [ ] Backups configurés
- [ ] Rate limiting activé
- [ ] Logs accessibles
- [ ] Zabbix connecté (si disponible)

---

## Support

**Documentation** :
- Next.js : https://nextjs.org/docs
- Vercel : https://vercel.com/docs
- PM2 : https://pm2.keymetrics.io/docs

**Problèmes courants** :
- Port déjà utilisé → Changer PORT dans .env
- Build fail → Vérifier Node.js version (20+)
- 502 Bad Gateway → PM2 pas démarré

---

**Déploiement estimé** : 5-10 minutes avec Vercel  
**Déploiement estimé** : 30 minutes avec serveur Linux

🚀 Bonne chance pour le déploiement !
