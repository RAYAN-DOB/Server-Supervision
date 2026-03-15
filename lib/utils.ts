import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return formatDate(d);
}

export function getStatusColor(status: "ok" | "warning" | "critical" | "maintenance"): string {
  const colors = {
    ok: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-orange-500",
    critical: "from-red-500 to-pink-500",
    maintenance: "from-blue-500 to-cyan-500",
  };
  return colors[status];
}

export function getSeverityColor(severity: "info" | "minor" | "major" | "critical"): string {
  const colors = {
    info: "#00F0FF",
    minor: "#FFD600",
    major: "#FF8A00",
    critical: "#FF0055",
  };
  return colors[severity];
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatHumidity(humidity: number): string {
  return `${humidity.toFixed(0)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getTemperatureStatus(temp: number): "ok" | "warning" | "critical" {
  if (temp > 30) return "critical";
  if (temp > 25) return "warning";
  return "ok";
}

export function getHumidityStatus(humidity: number): "ok" | "warning" | "critical" {
  if (humidity < 30 || humidity > 70) return "critical";
  if (humidity < 40 || humidity > 60) return "warning";
  return "ok";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
