"use client";

import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils/cn";
import { Menu } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function TopBar({ title, subtitle, children }: TopBarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-topbar items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all duration-layout md:px-6",
        sidebarOpen ? "md:ml-sidebar" : "md:ml-sidebar-sm"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — only visible below md */}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="hidden text-2xs text-muted-foreground sm:block">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
