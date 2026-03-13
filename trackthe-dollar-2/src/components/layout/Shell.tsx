"use client";

import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils/cn";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <main
      className={cn(
        "min-h-[calc(100vh-3.5rem)] transition-all duration-200 p-6",
        sidebarOpen ? "ml-56" : "ml-16"
      )}
    >
      {children}
    </main>
  );
}
