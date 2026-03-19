// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { TDAgentWidget } from "@/components/shared/TDAgentWidget";
import AlertsController from "@/components/alerts/AlertsController";
import LatestNewsSEO from "@/components/alerts/LatestNewsSEO";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <AlertsController />
      {children}
      <TDAgentWidget />
      <LatestNewsSEO />
    </div>
  );
}
