"use client";

import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils/cn";
import { Menu, Bell } from "lucide-react";
import { SharePopover } from "@/components/shared/SharePopover";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function TopBar({ title, subtitle, children }: TopBarProps) {
  const { sidebarOpen, toggleSidebar, toggleAlerts } = useUIStore();

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
      <div className="flex items-center gap-2">
        {children}
        <LanguageSwitcher />
        <ThemeToggle />
        <SharePopover />
        <button
          onClick={toggleAlerts}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Live alerts feed"
          title="Live Government Feed"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
        </button>
      </div>
    </header>
  );
}
