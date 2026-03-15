import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Site, Alert, User, ZabbixConfig, DashboardWidget, ChatMessage, SiteReference } from "@/types";

interface UIState {
  sidebarOpen: boolean;
  viewMode: "grid" | "list" | "map";
  theme: "dark" | "light";
  soundEnabled: boolean;
  kioskMode: boolean;
}

interface StoreState {
  // UI State
  ui: UIState;
  setUIState: (state: Partial<UIState>) => void;
  
  // Sites supervision (mock/Zabbix)
  sites: Site[];
  setSites: (sites: Site[]) => void;

  // Référentiel des sites (chargé depuis le hook useSitesReference)
  siteReferences: SiteReference[];
  setSiteReferences: (refs: SiteReference[]) => void;
  updateSiteReference: (id: string, updates: Partial<SiteReference>) => void;
  
  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  acknowledgeAlert: (alertId: string, userName: string) => void;
  
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Zabbix Config
  zabbixConfig: ZabbixConfig;
  setZabbixConfig: (config: Partial<ZabbixConfig>) => void;
  
  // Dashboard
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Filters
  filters: {
    siteType: string[];
    status: string[];
    severity: string[];
  };
  setFilters: (filters: Partial<StoreState["filters"]>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Initial UI State
      ui: {
        sidebarOpen: true,
        viewMode: "grid",
        theme: "dark",
        soundEnabled: true,
        kioskMode: false,
      },
      setUIState: (state) =>
        set((prev) => ({
          ui: { ...prev.ui, ...state },
        })),

      // Sites supervision
      sites: [],
      setSites: (sites) => set({ sites }),

      // Référentiel des sites
      siteReferences: [],
      setSiteReferences: (siteReferences) => set({ siteReferences }),
      updateSiteReference: (id, updates) =>
        set((state) => ({
          siteReferences: state.siteReferences.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      // Alerts
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      acknowledgeAlert: (alertId, userName) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  acknowledged: true,
                  acknowledgedBy: userName,
                  acknowledgedAt: new Date().toISOString(),
                }
              : alert
          ),
        })),

      // User
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Zabbix Config
      zabbixConfig: {
        apiUrl: "",
        connected: false,
      },
      setZabbixConfig: (config) =>
        set((state) => ({
          zabbixConfig: { ...state.zabbixConfig, ...config },
        })),

      // Dashboard Widgets
      widgets: [
        {
          id: "1",
          type: "kpi",
          title: "Sites Totaux",
          position: { x: 0, y: 0 },
          size: { w: 1, h: 1 },
        },
        {
          id: "2",
          type: "kpi",
          title: "Alertes Actives",
          position: { x: 1, y: 0 },
          size: { w: 1, h: 1 },
        },
        {
          id: "3",
          type: "chart",
          title: "Température Moyenne",
          position: { x: 0, y: 1 },
          size: { w: 2, h: 2 },
        },
      ],
      setWidgets: (widgets) => set({ widgets }),

      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChat: () => set({ chatMessages: [] }),

      // Filters
      filters: {
        siteType: [],
        status: [],
        severity: [],
      },
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
    }),
    {
      name: "aurion-storage",
      partialize: (state) => ({
        ui: state.ui,
        // Ne pas persister apiToken — rester côté serveur uniquement (ZABBIX_API_TOKEN)
        zabbixConfig: {
          apiUrl: state.zabbixConfig.apiUrl,
          connected: false,
        },
        widgets: state.widgets,
        filters: state.filters,
      }),
    }
  )
);
