"use client";

import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils/cn";

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function TopBar({ title, subtitle, children }: TopBarProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-topbar items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all duration-layout sm:px-6",
        sidebarOpen ? "md:ml-sidebar" : "md:ml-sidebar-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-2xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
