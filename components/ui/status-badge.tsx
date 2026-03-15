import { cn } from "@/lib/utils";
import type { AddressStatus, ZabbixStatus, SensorsStatus, SiteStatus } from "@/types";

// ─── Badge générique ──────────────────────────────────────────────────────────

interface StatusBadgeProps {
  label: string;
  color: "green" | "orange" | "gray" | "blue" | "violet" | "red" | "yellow";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const COLOR_CLASSES: Record<StatusBadgeProps["color"], string> = {
  green:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  gray:   "bg-gray-500/15   text-gray-400   border-gray-500/30",
  blue:   "bg-blue-500/15   text-blue-400   border-blue-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  red:    "bg-red-500/15    text-red-400    border-red-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const DOT_CLASSES: Record<StatusBadgeProps["color"], string> = {
  green:  "bg-emerald-400",
  orange: "bg-orange-400",
  gray:   "bg-gray-400",
  blue:   "bg-blue-400",
  violet: "bg-violet-400",
  red:    "bg-red-400",
  yellow: "bg-yellow-400",
};

export function StatusBadge({
  label,
  color,
  size = "sm",
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        COLOR_CLASSES[color],
        className
      )}
    >
      {dot && (
        <span
          className={cn("rounded-full flex-shrink-0", DOT_CLASSES[color], size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")}
        />
      )}
      {label}
    </span>
  );
}

// ─── Badge statut adresse ─────────────────────────────────────────────────────

const ADDRESS_STATUS_CONFIG: Record<
  AddressStatus,
  { label: string; color: StatusBadgeProps["color"] }
> = {
  verified:                { label: "Vérifiée",       color: "green"  },
  needs_manual_validation: { label: "À valider",      color: "orange" },
  internal_only:           { label: "Interne",         color: "gray"   },
};

interface AddressBadgeProps {
  status: AddressStatus;
  size?: "sm" | "md";
  className?: string;
}

export function AddressBadge({ status, size, className }: AddressBadgeProps) {
  const cfg = ADDRESS_STATUS_CONFIG[status];
  return <StatusBadge label={cfg.label} color={cfg.color} size={size} className={className} />;
}

// ─── Badge statut Zabbix ──────────────────────────────────────────────────────

const ZABBIX_STATUS_CONFIG: Record<
  ZabbixStatus,
  { label: string; color: StatusBadgeProps["color"] }
> = {
  connected:     { label: "Connecté",    color: "blue"   },
  partial:       { label: "Partiel",     color: "yellow" },
  pending:       { label: "En attente",  color: "orange" },
  not_connected: { label: "Non connecté", color: "gray"  },
};

interface ZabbixBadgeProps {
  status: ZabbixStatus;
  size?: "sm" | "md";
  className?: string;
}

export function ZabbixBadge({ status, size, className }: ZabbixBadgeProps) {
  const cfg = ZABBIX_STATUS_CONFIG[status];
  return <StatusBadge label={cfg.label} color={cfg.color} size={size} className={className} />;
}

// ─── Badge statut capteurs ────────────────────────────────────────────────────

const SENSORS_STATUS_CONFIG: Record<
  SensorsStatus,
  { label: string; color: StatusBadgeProps["color"] }
> = {
  active:  { label: "Actifs",   color: "green"  },
  partial: { label: "Partiels", color: "yellow" },
  none:    { label: "Aucun",    color: "gray"   },
};

interface SensorsBadgeProps {
  status: SensorsStatus;
  size?: "sm" | "md";
  className?: string;
}

export function SensorsBadge({ status, size, className }: SensorsBadgeProps) {
  const cfg = SENSORS_STATUS_CONFIG[status];
  return <StatusBadge label={cfg.label} color={cfg.color} size={size} className={className} />;
}

// ─── Badge statut supervision ─────────────────────────────────────────────────

const SUPERVISION_STATUS_CONFIG: Record<
  SiteStatus,
  { label: string; color: StatusBadgeProps["color"] }
> = {
  ok:          { label: "OK",         color: "green"  },
  warning:     { label: "Warning",    color: "yellow" },
  critical:    { label: "Critique",   color: "red"    },
  maintenance: { label: "Maintenance",color: "blue"   },
};

interface SupervisionBadgeProps {
  status: SiteStatus;
  size?: "sm" | "md";
  className?: string;
}

export function SupervisionBadge({ status, size, className }: SupervisionBadgeProps) {
  const cfg = SUPERVISION_STATUS_CONFIG[status];
  return <StatusBadge label={cfg.label} color={cfg.color} size={size} className={className} />;
}

// ─── Badge DSI ────────────────────────────────────────────────────────────────

interface DsiBadgeProps {
  managed: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DsiBadge({ managed, size, className }: DsiBadgeProps) {
  return (
    <StatusBadge
      label={managed ? "DSI" : "Externe"}
      color={managed ? "violet" : "gray"}
      size={size}
      className={className}
    />
  );
}
