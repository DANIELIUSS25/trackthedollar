"use client";

import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils/cn";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <main
      className={cn(
        "min-h-[calc(100vh-3.5rem)] transition-all duration-layout p-6",
        sidebarOpen ? "ml-sidebar" : "ml-sidebar-sm",
        className
      )}
    >
      <div className="mx-auto max-w-dashboard animate-fade-in">
        {children}
      </div>
    </main>
  );
}
