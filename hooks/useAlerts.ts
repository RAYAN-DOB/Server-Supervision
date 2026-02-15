import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { MOCK_ALERTS } from "@/data/mock-sites";

export function useAlerts() {
  const { alerts, setAlerts } = useStore();

  const query = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      // In production, fetch from Zabbix API
      // const response = await fetch('/api/zabbix/triggers');
      // return response.json();
      
      return MOCK_ALERTS;
    },
    onSuccess: (data) => {
      setAlerts(data);
    },
    initialData: alerts.length > 0 ? alerts : undefined,
    refetchInterval: 30000, // Refetch every 30s
  });

  return {
    alerts: query.data || alerts,
    activeAlerts: (query.data || alerts).filter(a => !a.acknowledged && !a.resolved),
    criticalAlerts: (query.data || alerts).filter(a => a.severity === "critical" && !a.acknowledged),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
