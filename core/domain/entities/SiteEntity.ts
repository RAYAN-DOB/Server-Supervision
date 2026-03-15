import type { SiteStatus, Severity, SiteCategory, AddressStatus, ZabbixStatus, SensorsStatus } from "@/types";

export interface SiteEntity {
  id: string;
  name: string;
  aliases?: string[];
  address: string | null;
  postalCode: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  addressStatus: AddressStatus;
  ltNames: string[];
  ltCount: number;
  telephonyEquipment?: string | null;
  likelyManagedByDSI: boolean;
  category?: SiteCategory;
  zabbixStatus: ZabbixStatus;
  sensorsStatus: SensorsStatus;
  zabbixEnabled: boolean;
  zabbixHostId?: string | null;
  visibleOnMap: boolean;
  notes?: string | null;
  blackboxInstalled?: boolean;
  blackboxModel?: string | null;
  blackboxSerial?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteWithSupervision extends SiteEntity {
  status: SiteStatus;
  temperature: number;
  humidity: number;
  uptime: number;
  powerConsumption: number;
  bayCount: number;
  alertCount: number;
  lastUpdate: string;
}
