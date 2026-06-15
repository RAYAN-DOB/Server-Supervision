# AURION — Supervision environnementale des salles serveurs

AURION est une interface web de supervision réalisée dans le cadre du **BTS CIEL option Informatique et Réseaux — Session 2026**.

Le projet vise à rendre lisibles les données environnementales des salles serveurs de la **DSI de la Ville de Maisons-Alfort** : température, humidité, état des capteurs, alertes et disponibilité des sites.

## Objectif du projet

Avant AURION, un problème physique en salle serveur pouvait rester difficile à identifier immédiatement : hausse de température, humidité anormale, coupure électrique, présence d'eau ou incident local.

AURION permet de visualiser ces informations dans une interface plus simple et plus orientée exploitation, tout en conservant **Zabbix comme source de vérité**.

```text
Capteurs Black Box
        ↓
Gateway Black Box AlertWerks / ServSensor
        ↓
SNMPv3 authPriv
        ↓
Zabbix 7.4
        ↓
Items / triggers / historiques / alertes
        ↓
API JSON-RPC Zabbix
        ↓
Interface web AURION
```

## Principe important

AURION ne collecte pas directement les capteurs.

- Les **capteurs Black Box** mesurent l'environnement physique.
- La **gateway Black Box** centralise les mesures et les expose en SNMP.
- **Zabbix** interroge la gateway, historise les valeurs et déclenche les alertes.
- **AURION** lit les informations via l'API Zabbix et les affiche sous forme de dashboard.

Cette séparation évite de dupliquer la logique de supervision dans l'application web.

## Technologies utilisées

- **Next.js 15** : framework React pour l'application web.
- **React** : composants d'interface réutilisables.
- **TypeScript** : typage des sites, capteurs, alertes et statuts.
- **Tailwind CSS** : mise en page et design.
- **Leaflet / React Leaflet** : cartographie des sites.
- **Zabbix API JSON-RPC** : récupération des données de supervision.
- **SNMPv3 authPriv** : collecte sécurisée entre Zabbix et les gateways.
- **PostgreSQL / TimescaleDB** : stockage côté supervision Zabbix.
- **Proxmox VE / Debian** : hébergement de la VM Zabbix dans le pilote.

## Vues principales

| Route | Rôle |
|---|---|
| `/dashboard` | Vue globale de supervision |
| `/carte` | Carte des sites municipaux |
| `/sites` | Liste des sites supervisés |
| `/sites/[id]` | Détail d'un site |
| `/alertes` | Alertes et événements visibles côté AURION |
| `/demo` | Démonstration de soutenance avec données réelles ou mock |
| `/architecture` | Explication courte de la chaîne technique |

## Site de démonstration

Le site `DEMO-LAB` représente le mini-environnement utilisé pour la soutenance :

- mini PC / serveur de test ;
- Proxmox VE ;
- VM Debian ;
- Zabbix Server ;
- PostgreSQL / TimescaleDB ;
- gateway Black Box AlertWerks ;
- capteurs température / humidité / tension ;
- collecte SNMPv3 ;
- affichage dans AURION via API JSON-RPC.

Si Zabbix n'est pas joignable pendant l'oral, AURION peut utiliser des données de démonstration afin de conserver un support fiable.

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

Règles de sécurité :

- ne jamais écrire un token Zabbix directement dans un composant React ;
- garder les secrets côté serveur ;
- utiliser la route API interne comme intermédiaire ;
- utiliser un compte Zabbix/API en lecture seule pour AURION.

## Commandes utiles

```bash
npm run dev
npm run type-check
npm run build
```

## Comment expliquer le code à l'oral

Le projet est basé sur des composants React/Next.js adaptés au besoin AURION.

Méthode simple pour expliquer un fichier :

```text
Entrée : quelles données le fichier reçoit ?
Traitement : qu'est-ce qu'il fait avec ces données ?
Sortie : qu'est-ce qu'il affiche ou renvoie ?
Utilité : pourquoi ce fichier est important dans le projet ?
```

Exemple :

- un composant `SiteCard` reçoit un site et affiche ses informations ;
- un hook `useSites` récupère ou prépare une liste de sites ;
- une route API Zabbix interroge Zabbix côté serveur ;
- un type TypeScript définit la structure attendue d'une donnée.

## Scénario de démonstration BTS

1. Présenter l'architecture : capteurs → Black Box → SNMPv3 → Zabbix → AURION.
2. Montrer la carte ou le dashboard AURION.
3. Afficher un site supervisé ou le site `DEMO-LAB`.
4. Expliquer que Zabbix reste la source de vérité.
5. Montrer que l'interface rend les informations plus lisibles pour une exploitation DSI.

Phrase clé :

> AURION ne remplace pas Zabbix : il simplifie la lecture des données de supervision pour rendre l'état des sites plus compréhensible et exploitable.

## Auteur

**Rayan DOB**  
BTS CIEL option Informatique et Réseaux — Session 2026  
Ville de Maisons-Alfort — Direction des Systèmes d'Information
