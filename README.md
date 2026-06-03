# AURION - Supervision environnementale

AURION est une interface web de supervision pour les salles serveurs de la DSI de la Ville de Maisons-Alfort.

Le projet affiche de façon lisible les informations collectées par Zabbix depuis des gateways Black Box AlertWerks :

```text
Capteurs Black Box -> Gateway EME168A -> SNMPv3 authPriv -> Zabbix -> PostgreSQL/TimescaleDB -> API JSON-RPC -> AURION
```

L'application ne collecte pas directement les capteurs. Zabbix reste la source de vérité pour les hosts, items SNMP/OID, triggers, historiques et alertes.

## Vues utiles pour la soutenance

- `/dashboard` : vue globale HTDV, PLDS et DEMO-LAB.
- `/sites` : liste des sites supervisés et du site de démonstration.
- `/sites/DEMO-LAB` : fiche du mini-lab de soutenance.
- `/alertes` : alertes et triggers visibles côté AURION.
- `/demo` : page de démonstration live, connectée à Zabbix si l'API est disponible.
- `/architecture` : explication courte de la chaîne technique.

## Site de démonstration

Le site `DEMO-LAB` représente le mini-environnement présenté au jury :

- mini PC avec Proxmox VE ;
- VM Debian ;
- Zabbix Server ;
- PostgreSQL / TimescaleDB ;
- gateway Black Box AlertWerks ;
- capteurs température / humidité / tension AC ;
- collecte SNMPv3 authPriv ;
- affichage dans AURION via API JSON-RPC.

En mode réel, la page `/demo` cherche un host Zabbix nommé `BLACKBOX-DEMO` ou le host configuré dans les variables d'environnement.
Si Zabbix n'est pas accessible, la page passe en mode mock pour permettre une démonstration propre sans bloquer l'oral.

## Installation locale

```bash
npm install
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:3000
```

## Variables d'environnement

Créer un fichier `.env.local` à partir de `.env.example`.

```env
ZABBIX_API_URL=http://10.200.1.52/zabbix/api_jsonrpc.php
ZABBIX_API_TOKEN=xxxxxxxxxxxxxxxx
ZABBIX_DEMO_HOST_NAME=BLACKBOX-DEMO
ZABBIX_DEMO_HOST_ID=
NEXT_PUBLIC_DEMO_MODE=true
INITIAL_DSI_PASSWORD=mot-de-passe-temporaire-a-changer
AUTH_SECRET=generer-une-valeur-longue-aleatoire
```

Important :

- le token Zabbix reste côté serveur ;
- aucun secret ne doit être écrit dans les composants React ;
- la route `/api/zabbix/demo` sert d'intermédiaire entre le navigateur et Zabbix.
- le mot de passe initial des comptes de démonstration doit venir de `INITIAL_DSI_PASSWORD`, pas du code source.

## Mode mock / démo

Sans `ZABBIX_API_URL`, AURION utilise des données de démonstration.

Ce mode sert à :

- répéter l'oral sans dépendre du réseau ;
- montrer l'interface même si le mini-lab n'est pas joignable ;
- garder une solution de secours pendant la soutenance.

## Connexion Zabbix réelle

Dans Zabbix :

1. Créer ou identifier le host `BLACKBOX-DEMO`.
2. Configurer l'interface SNMPv3 de la gateway Black Box.
3. Créer les items SNMP/OID utiles : température, humidité, tension AC, disponibilité.
4. Créer les triggers : température Warning/High, humidité Warning/High, perte tension, host injoignable.
5. Générer un token API Zabbix en lecture seule.
6. Renseigner `ZABBIX_API_URL`, `ZABBIX_API_TOKEN` et `ZABBIX_DEMO_HOST_NAME`.

## Déploiement Vercel

Configurer les mêmes variables dans Vercel :

- `ZABBIX_API_URL`
- `ZABBIX_API_TOKEN`
- `ZABBIX_DEMO_HOST_NAME`
- `NEXT_PUBLIC_DEMO_MODE`

Si l'instance Zabbix est sur un réseau privé, Vercel ne pourra pas la joindre directement. Pour la soutenance, utiliser le mode mock ou exposer temporairement une API de test sécurisée.

## Scénario de démonstration BTS

1. Présenter l'architecture : capteurs -> Black Box -> SNMPv3 -> Zabbix -> AURION.
2. Montrer le mini PC Proxmox et la VM Debian/Zabbix.
3. Montrer la gateway Black Box et les capteurs.
4. Ouvrir Zabbix et vérifier les dernières valeurs SNMP/OID.
5. Ouvrir AURION `/demo` et montrer que le site `DEMO-LAB` affiche les mêmes informations de façon plus simple.

Phrase clé :

> La démo reproduit à petite échelle la chaîne déployée en entreprise. Ce n'est pas une page séparée : `DEMO-LAB` est traité comme un vrai site supervisé, avec ses capteurs, ses items Zabbix et ses triggers.

## Commandes de vérification

```bash
npm run type-check
npm run build
```

## Dépôt

Projet BTS CIEL IR - Rayan DOB  
Ville de Maisons-Alfort - DSI
