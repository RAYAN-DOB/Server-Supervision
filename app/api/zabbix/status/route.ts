/**
 * Route API : GET /api/zabbix/status
 *
 * Rôle dans AURION : indicateur de "santé" de la liaison avec Zabbix.
 * Renvoie l'objet ZabbixConnectionStatus (connecté ou non, mode mock,
 * version de l'API, compteurs hosts/triggers). Sert au bandeau d'état du front.
 */
import { NextResponse } from "next/server";
import { getZabbixStatus } from "@/lib/zabbix/client";

export async function GET() {
  // Toute la logique (test de connexion + repli mock) est déléguée au client ;
  // ici on se contente de renvoyer le statut tel quel en JSON.
  const status = await getZabbixStatus();
  return NextResponse.json(status);
}
