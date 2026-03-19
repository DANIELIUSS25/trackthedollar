"use client";
// src/stores/useUIStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  alertsOpen: boolean;
  setAlertsOpen: (open: boolean) => void;
  toggleAlerts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      alertsOpen: false,
      setAlertsOpen: (open) => set({ alertsOpen: open }),
      toggleAlerts: () => set((s) => ({ alertsOpen: !s.alertsOpen })),
    }),
    { name: "ttd-ui" }
  )
);
