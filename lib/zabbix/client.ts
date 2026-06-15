/**
 * Zabbix API Client
 *
 * Implémentation réelle du client Zabbix JSON-RPC 2.0.
 * Si ZABBIX_API_URL n'est pas défini, bascule automatiquement sur les données mock.
 *
 * Variables d'environnement requises (sur le serveur) :
 *   ZABBIX_API_URL     ex: http://192.168.1.100/zabbix/api_jsonrpc.php
 *   ZABBIX_API_TOKEN   Token API généré depuis Zabbix ≥ 5.4 (recommandé)
 *   ZABBIX_USER        Ou nom d'utilisateur (alternative au token)
 *   ZABBIX_PASSWORD    Mot de passe (si on utilise user/password)
 */

import type { Site, Alert } from "@/types";

// Statut de connexion renvoyé au front : indique si on parle vraiment à Zabbix
// (connected) ou si on affiche des valeurs de secours (useMock), + compteurs.
export interface ZabbixConnectionStatus {
  connected: boolean;
  useMock: boolean;
  apiVersion?: string;
  error?: string;
  lastSync: string;
  hostsCount: number;
  itemsCount: number;
  triggersActive: number;
}

interface ZabbixConfig {
  apiUrl: string;
  apiToken?: string;
  username?: string;
  password?: string;
}

// Client bas niveau qui dialogue avec l'API JSON-RPC 2.0 de Zabbix.
// Rôle dans AURION : seul point d'entrée pour LIRE les données de supervision
// (hosts, items, triggers...). Aucune écriture sauf acquittement d'événement.
export class ZabbixClient {
  private config: ZabbixConfig;
  private authToken?: string;
  // Identifiant incrémental exigé par le protocole JSON-RPC pour chaque requête.
  private requestId = 1;

  constructor(config: ZabbixConfig) {
    this.config = config;
  }

  /**
   * Authentification : supporte API token (Zabbix ≥ 5.4) et user.login
   */
  async authenticate(): Promise<boolean> {
    try {
      // Cas privilégié : un token API existe déjà, pas besoin d'appeler Zabbix.
      // Si un token API est fourni, on l'utilise directement
      if (this.config.apiToken) {
        this.authToken = this.config.apiToken;
        return true;
      }

      // Repli : on échange identifiant + mot de passe contre un jeton de session.
      // Sinon, on tente user.login
      if (this.config.username && this.config.password) {
        const response = await this.rawRequest('user.login', {
          username: this.config.username,
          password: this.config.password,
        }, null);

        if (typeof response === 'string') {
          this.authToken = response;
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[Zabbix] Authentication failed:', error);
      return false;
    }
  }

  /**
   * Vérifie la connexion et retourne la version de l'API
   */
  async getApiVersion(): Promise<string> {
    const result = await this.rawRequest('apiinfo.version', {}, null);
    return typeof result === 'string' ? result : '0.0.0';
  }

  /**
   * Retourne les hosts surveillés
   */
  async getHosts(): Promise<any[]> {
    // host.get = méthode Zabbix listant les équipements supervisés.
    // 'output' limite les champs ramenés ; les 'select*' joignent interfaces,
    // groupes et tags pour pouvoir afficher IP, classement et libellés.
    return this.makeRequest('host.get', {
      output: ['hostid', 'host', 'name', 'status', 'available'],
      selectInterfaces: ['ip', 'port', 'type'],
      selectGroups: ['groupid', 'name'],
      selectTags: ['tag', 'value'],
    });
  }

  /**
   * Retourne les items (capteurs) d'un host
   */
  async getItems(hostId: string): Promise<any[]> {
    // item.get = les capteurs/mesures d'un host (température, humidité, ping...).
    // lastvalue = dernière valeur lue, lastclock = date de cette lecture.
    // filter state:0 ne garde que les items "normaux" (on écarte ceux en erreur).
    return this.makeRequest('item.get', {
      hostids: hostId,
      output: ['itemid', 'name', 'key_', 'lastvalue', 'units', 'lastclock'],
      sortfield: 'name',
      filter: { state: 0 },
    });
  }

  /**
   * Retourne l'historique d'un item
   */
  async getHistory(
    itemId: string,
    timeFrom?: number,
    timeTill?: number
  ): Promise<any[]> {
    // history.get = courbe d'évolution d'un item. Zabbix travaille en secondes
    // Unix : par défaut on demande les dernières 24h (86400 s) jusqu'à maintenant.
    // history:0 = valeurs numériques flottantes ; tri du plus récent au plus ancien.
    return this.makeRequest('history.get', {
      itemids: itemId,
      history: 0,
      time_from: timeFrom ?? Math.floor(Date.now() / 1000) - 86400,
      time_till: timeTill ?? Math.floor(Date.now() / 1000),
      sortfield: 'clock',
      sortorder: 'DESC',
      limit: 100,
    });
  }

  /**
   * Retourne les triggers actifs (alertes)
   */
  async getTriggers(): Promise<any[]> {
    // trigger.get = les conditions d'alerte. filter value:1 = uniquement les
    // triggers en état "PROBLEM" (1), donc les alertes réellement actives.
    // expandDescription remplace les macros {HOST.NAME} par leur vraie valeur.
    return this.makeRequest('trigger.get', {
      output: ['triggerid', 'description', 'priority', 'lastchange', 'value', 'comments'],
      filter: { value: 1 },
      selectHosts: ['hostid', 'name'],
      sortfield: 'priority',
      sortorder: 'DESC',
      expandDescription: true,
    });
  }

  /**
   * Retourne l'historique des événements
   */
  async getEvents(timeFrom?: number): Promise<any[]> {
    // event.get = journal des événements (alertes déclenchées/résolues).
    // Par défaut on remonte 7 jours en arrière (86400 s x 7).
    return this.makeRequest('event.get', {
      output: ['eventid', 'acknowledged', 'clock', 'value', 'severity'],
      time_from: timeFrom ?? Math.floor(Date.now() / 1000) - 86400 * 7,
      selectHosts: ['name'],
      selectAcknowledges: ['message', 'clock', 'user'],
      sortfield: 'clock',
      sortorder: 'DESC',
      limit: 100,
    });
  }

  /**
   * Acquitte un événement
   */
  async acknowledgeEvent(eventId: string, message: string): Promise<boolean> {
    try {
      // Seule opération d'écriture d'AURION vers Zabbix : action 6 = acquitter
      // l'événement ET y ajouter un message de commentaire.
      await this.makeRequest('event.acknowledge', {
        eventids: eventId,
        action: 6,
        message,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Récupère les statistiques globales
   */
  async getStats(): Promise<{ hostsCount: number; itemsCount: number; triggersActive: number }> {
    try {
      // countOutput:true demande à Zabbix de renvoyer un simple total (chaîne)
      // au lieu de la liste complète : plus léger pour des compteurs.
      // Les deux requêtes partent en parallèle (Promise.all) pour aller plus vite.
      const [hosts, triggers] = await Promise.all([
        this.makeRequest('host.get', { output: ['hostid'], countOutput: true }),
        this.makeRequest('trigger.get', { filter: { value: 1 }, countOutput: true }),
      ]);
      return {
        hostsCount: parseInt(hosts) || 0,
        itemsCount: 0,
        triggersActive: parseInt(triggers) || 0,
      };
    } catch {
      return { hostsCount: 0, itemsCount: 0, triggersActive: 0 };
    }
  }

  // Requête "authentifiée" : exige un jeton, sinon erreur. Toutes les méthodes
  // métier (getHosts, getItems...) passent par ici.
  private async makeRequest(method: string, params: any): Promise<any> {
    if (!this.authToken) {
      throw new Error('Non authentifié');
    }
    return this.rawRequest(method, params, this.authToken);
  }

  // Coeur du client : construit et envoie l'appel HTTP JSON-RPC, gère le timeout
  // et les erreurs. Utilisé aussi sans jeton (login, version de l'API).
  private async rawRequest(method: string, params: any, auth: string | null): Promise<any> {
    // AbortController + setTimeout : on coupe l'appel après 10 s pour éviter
    // que l'interface AURION ne reste bloquée si Zabbix ne répond pas.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      // Enveloppe standard JSON-RPC 2.0 : version, méthode appelée, paramètres
      // et un id unique (requestId++) pour relier la réponse à la requête.
      const body: any = {
        jsonrpc: '2.0',
        method,
        params,
        id: this.requestId++,
      };

      // Zabbix 7.4 : jeton dans le header Authorization.
      // Ne pas ajouter "auth" dans le corps JSON-RPC : sur les versions
      // recentes cela peut retourner des resultats vides ou incoherents.
      const headers: Record<string, string> = {
        'Content-Type': 'application/json-rpc',
      };

      if (auth && method !== 'user.login' && method !== 'apiinfo.version') {
        headers['Authorization'] = `Bearer ${auth}`;
      }

      // L'API Zabbix s'interroge toujours en POST sur api_jsonrpc.php.
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Erreur réseau / HTTP (404, 500...) : le serveur n'a pas répondu OK.
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Subtilité JSON-RPC : un appel peut renvoyer HTTP 200 tout en contenant
      // une erreur applicative dans data.error (ex : droits, paramètre invalide).
      if (data.error) {
        throw new Error(`Zabbix API Error ${data.error.code}: ${data.error.data || data.error.message}`);
      }

      return data.result;
    } finally {
      // Quoi qu'il arrive, on annule le minuteur pour ne pas fuiter de timer.
      clearTimeout(timeout);
    }
  }
}

// ─── Singleton avec variables d'environnement ──────────────────────────────

// Instance unique réutilisée dans toute l'app (patron Singleton) : évite de
// recréer un client à chaque requête API.
let _client: ZabbixClient | null = null;

export function getZabbixClient(): ZabbixClient | null {
  // Pas d'URL configurée = pas de Zabbix : on renvoie null pour basculer en mock.
  const apiUrl = process.env.ZABBIX_API_URL;
  if (!apiUrl) return null;

  // Création paresseuse : on instancie le client une seule fois, avec les
  // secrets lus côté serveur (jamais exposés au navigateur).
  if (!_client) {
    _client = new ZabbixClient({
      apiUrl,
      apiToken: process.env.ZABBIX_API_TOKEN,
      username: process.env.ZABBIX_USER,
      password: process.env.ZABBIX_PASSWORD,
    });
  }
  return _client;
}

/**
 * Tente de se connecter à Zabbix et retourne le statut complet.
 * Si la connexion échoue ou si les variables d'env sont absentes,
 * retourne un statut mock.
 */
export async function getZabbixStatus(): Promise<ZabbixConnectionStatus> {
  const client = getZabbixClient();

  // 1er cas de repli : aucune config Zabbix -> on renvoie un statut mock cohérent
  // (chiffres factices) pour que la démo fonctionne sans serveur de supervision.
  if (!client) {
    return {
      connected: false,
      useMock: true,
      error: 'ZABBIX_API_URL non configurée — mode laboratoire actif',
      lastSync: new Date().toISOString(),
      hostsCount: 12,
      itemsCount: 156,
      triggersActive: 5,
    };
  }

  try {
    // 2e cas de repli : config présente mais identifiants/jeton refusés.
    const authenticated = await client.authenticate();
    if (!authenticated) {
      return {
        connected: false,
        useMock: true,
        error: 'Authentification Zabbix échouée — vérifiez ZABBIX_API_TOKEN / ZABBIX_USER / ZABBIX_PASSWORD',
        lastSync: new Date().toISOString(),
        hostsCount: 12,
        itemsCount: 156,
        triggersActive: 5,
      };
    }

    // Cas nominal : connexion OK. On récupère en parallèle la version de l'API
    // et les compteurs (hosts, triggers actifs) pour les afficher dans le tableau de bord.
    const [apiVersion, stats] = await Promise.all([
      client.getApiVersion(),
      client.getStats(),
    ]);

    return {
      connected: true,
      useMock: false,
      apiVersion,
      lastSync: new Date().toISOString(),
      hostsCount: stats.hostsCount,
      itemsCount: stats.itemsCount,
      triggersActive: stats.triggersActive,
    };
  } catch (error) {
    return {
      connected: false,
      useMock: true,
      error: error instanceof Error ? error.message : 'Erreur de connexion inconnue',
      lastSync: new Date().toISOString(),
      hostsCount: 12,
      itemsCount: 156,
      triggersActive: 5,
    };
  }
}

// ─── Mappers Zabbix → types AURION ──────────────────────────────────────────

// Traduit un host Zabbix (format brut) en "Site" au sens AURION.
// Le champ Zabbix 'available' code l'état : '1' = joignable, '2' = injoignable,
// '0' = état inconnu. On le convertit dans le vocabulaire métier ok/warning/critical.
export function mapZabbixHostToSite(host: any): Partial<Site> {
  const available = host.available;
  let status: Site['status'] = 'ok';
  if (available === '2') status = 'critical';
  else if (available === '0') status = 'warning';

  return {
    id: host.hostid,
    name: host.name || host.host,
    status,
  };
}

// Traduit un trigger Zabbix en "Alert" AURION.
// lastchange est un timestamp Unix en secondes -> on multiplie par 1000 pour
// obtenir des millisecondes (format attendu par JS) puis une date ISO lisible.
export function mapZabbixTriggerToAlert(trigger: any): Partial<Alert> {
  return {
    id: trigger.triggerid,
    title: trigger.description,
    severity: getPriorityFromZabbix(trigger.priority),
    timestamp: new Date(parseInt(trigger.lastchange) * 1000).toISOString(),
    siteId: trigger.hosts?.[0]?.hostid,
    siteName: trigger.hosts?.[0]?.name,
    acknowledged: false,
  };
}

// Table de correspondance priorité Zabbix (0 à 5) -> gravité AURION.
// Zabbix : 0/1 = information, 2 = warning, 3 = average, 4 = high, 5 = disaster.
function getPriorityFromZabbix(priority: string): 'info' | 'minor' | 'major' | 'critical' {
  const map: Record<string, 'info' | 'minor' | 'major' | 'critical'> = {
    '0': 'info',
    '1': 'info',
    '2': 'minor',
    '3': 'major',
    '4': 'critical',
    '5': 'critical',
  };
  return map[priority] ?? 'info';
}
