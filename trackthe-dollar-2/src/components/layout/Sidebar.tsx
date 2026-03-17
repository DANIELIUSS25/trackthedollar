"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  BookOpen,
  Percent,
  Banknote,
  Shield,
  Globe,
  Gauge,
  Swords,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/useUIStore";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Market Intelligence",
    items: [
      { label: "Dollar Strength", href: "/dollar-strength", icon: DollarSign },
      { label: "National Debt", href: "/debt", icon: Landmark },
      { label: "Inflation", href: "/inflation", icon: Percent },
      { label: "Interest Rates", href: "/rates", icon: TrendingUp },
      { label: "Money Supply", href: "/money-supply", icon: Banknote },
      { label: "Defense Spending", href: "/defense", icon: Shield },
      { label: "Foreign Assistance", href: "/foreign-assistance", icon: Globe },
    ],
  },
  {
    label: "Derived Proxies",
    items: [
      { label: "Monetary Expansion", href: "/monetary-expansion", icon: Gauge },
      { label: "War Spending", href: "/war-spending", icon: Swords },
    ],
  },
  {
    label: "Transparency",
    items: [
      { label: "Methodology", href: "/methodology", icon: BookOpen },
      { label: "Source Health", href: "/source-health", icon: Activity },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border transition-all duration-layout",
        "bg-gradient-to-b from-card to-background",
        sidebarOpen ? "w-sidebar" : "w-sidebar-sm"
      )}
    >
      {/* ─── Logo ──────────────────────────────────────────── */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-glow">
            <DollarSign className="h-4 w-4 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight tracking-tight">
                TrackThe<span className="text-primary">Dollar</span>
              </span>
              <span className="text-2xs text-muted-foreground">Macro Intelligence</span>
            </div>
          )}
        </Link>
      </div>

      {/* ─── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            {sidebarOpen && (
              <span className="label-sm mb-1.5 block px-3 text-muted-foreground/60">
                {section.label}
              </span>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-micro",
                      isActive
                        ? "bg-primary/8 text-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom ────────────────────────────────────────── */}
      <div className="border-t border-border px-2 py-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
