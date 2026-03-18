// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { TDAgentWidget } from "@/components/shared/TDAgentWidget";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Sidebar />
      {children}
      <TDAgentWidget />
    </div>
  );
}
