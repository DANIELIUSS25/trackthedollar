"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Landmark,
  TrendingUp,
  DollarSign,
  Percent,
  Banknote,
  Shield,
  Globe,
  Gauge,
  Swords,
  BookOpen,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dollar Strength", href: "/dollar-strength", icon: DollarSign },
  { label: "National Debt", href: "/debt", icon: Landmark },
  { label: "Inflation", href: "/inflation", icon: Percent },
  { label: "Interest Rates", href: "/rates", icon: TrendingUp },
  { label: "Money Supply", href: "/money-supply", icon: Banknote },
  { label: "Defense Spending", href: "/defense", icon: Shield },
  { label: "Foreign Assistance", href: "/foreign-assistance", icon: Globe },
  { label: "Monetary Expansion", href: "/monetary-expansion", icon: Gauge },
  { label: "War Spending", href: "/war-spending", icon: Swords },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
  { label: "Source Health", href: "/source-health", icon: Activity },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card shadow-panel"
        aria-label="Toggle navigation"
      >
        {open ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out nav */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow">
              <DollarSign className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">
              TrackThe<span className="text-primary">Dollar</span>
            </span>
          </Link>
        </div>

        <div className="overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Get Pro — $1.99/mo
          </Link>
        </div>
      </nav>
    </div>
  );
}
