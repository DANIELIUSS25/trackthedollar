"use client";

import { useCallback } from "react";
import { useUIStore } from "@/stores/useUIStore";
import AlertsTicker from "./AlertsTicker";
import AlertsDrawer from "./AlertsDrawer";

export default function AlertsController() {
  const { alertsOpen, setAlertsOpen } = useUIStore();
  const open = useCallback(() => setAlertsOpen(true), [setAlertsOpen]);
  const close = useCallback(() => setAlertsOpen(false), [setAlertsOpen]);

  return (
    <>
      <AlertsTicker onOpenDrawer={open} />
      <AlertsDrawer open={alertsOpen} onClose={close} />
    </>
  );
}
