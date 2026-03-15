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

export class ZabbixClient {
  private config: ZabbixConfig;
  private authToken?: string;
  private requestId = 1;

  constructor(config: ZabbixConfig) {
    this.config = config;
  }

  /**
   * Authentification : supporte API token (Zabbix ≥ 5.4) et user.login
   */
  async authenticate(): Promise<boolean> {
    try {
      // Si un token API est fourni, on l'utilise directement
      if (this.config.apiToken) {
        this.authToken = this.config.apiToken;
        return true;
      }

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

  private async makeRequest(method: string, params: any): Promise<any> {
    if (!this.authToken) {
      throw new Error('Non authentifié');
    }
    return this.rawRequest(method, params, this.authToken);
  }

  private async rawRequest(method: string, params: any, auth: string | null): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const body: any = {
        jsonrpc: '2.0',
        method,
        params,
        id: this.requestId++,
      };

      // Zabbix ≥ 5.4 : token dans le header Authorization
      // Zabbix < 5.4 : auth dans le corps
      const headers: Record<string, string> = {
        'Content-Type': 'application/json-rpc',
      };

      if (auth && method !== 'user.login' && method !== 'apiinfo.version') {
        // Essai avec Authorization header (≥ 5.4)
        headers['Authorization'] = `Bearer ${auth}`;
        // Et aussi dans le corps pour compatibilité (< 6.4)
        body.auth = auth;
      }

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Zabbix API Error ${data.error.code}: ${data.error.data || data.error.message}`);
      }

      return data.result;
    } finally {
      clearTimeout(timeout);
    }
  }
}

// ─── Singleton avec variables d'environnement ──────────────────────────────

let _client: ZabbixClient | null = null;

export function getZabbixClient(): ZabbixClient | null {
  const apiUrl = process.env.ZABBIX_API_URL;
  if (!apiUrl) return null;

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

  if (!client) {
    return {
      connected: false,
      useMock: true,
      error: 'ZABBIX_API_URL non configuré — données de démonstration actives',
      lastSync: new Date().toISOString(),
      hostsCount: 12,
      itemsCount: 156,
      triggersActive: 5,
    };
  }

  try {
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
