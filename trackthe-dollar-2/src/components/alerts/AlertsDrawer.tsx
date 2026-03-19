"use client";

import { useEffect, useRef, useState } from "react";
import type { GovAlert } from "@/lib/api/gov-alerts";
import { CATEGORY_COLORS } from "@/lib/api/gov-alerts";

interface AlertsDrawerProps {
  open: boolean;
  onClose: () => void;
  initialAlerts?: GovAlert[];
}

const CATEGORIES: { key: GovAlert["category"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fed", label: "Fed" },
  { key: "treasury", label: "Treasury" },
  { key: "whitehouse", label: "White House" },
  { key: "labor", label: "Labor" },
  { key: "cbo", label: "CBO" },
  { key: "bea", label: "BEA" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AlertsDrawer({ open, onClose, initialAlerts = [] }: AlertsDrawerProps) {
  const [alerts, setAlerts] = useState<GovAlert[]>(initialAlerts);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GovAlert["category"] | "all">("all");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/alerts");
      if (!res.ok) return;
      const json = await res.json();
      setAlerts(json.data ?? []);
      setLastRefresh(new Date());
    } catch {}
    finally { setLoading(false); }
  }

  // Fetch on open
  useEffect(() => {
    if (open) fetchAlerts();
  }, [open]);

  // Auto-refresh every 5 min when open
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  const filtered = activeCategory === "all"
    ? alerts
    : alerts.filter((a) => a.category === activeCategory);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Live Government Alerts"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-white">Live Feed</span>
            <span className="text-xs text-white/40">
              {alerts.length > 0 ? `${alerts.length} updates` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlerts}
              disabled={loading}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
              title="Refresh"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Last refresh */}
        {lastRefresh && (
          <div className="px-4 py-1.5 text-[10px] text-white/30 border-b border-white/5 flex-shrink-0">
            Updated {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 5 min
          </div>
        )}

        {/* Category filter tabs */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-white/10 flex-shrink-0 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const count = cat.key === "all" ? alerts.length : alerts.filter(a => a.category === cat.key).length;
            if (count === 0 && cat.key !== "all") return null;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full transition-all ${
                  activeCategory === cat.key
                    ? "bg-white text-black"
                    : "text-white/50 hover:text-white/80 bg-white/5"
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`ml-1 ${activeCategory === cat.key ? "text-black/50" : "text-white/30"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto">
          {loading && filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-white/30 text-sm">
              Loading live feed...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-white/30 text-sm">
              No updates available
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((alert) => (
                <a
                  key={alert.id}
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  {/* Source + time */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: CATEGORY_COLORS[alert.category] }}
                    >
                      {alert.sourceLabel}
                    </span>
                    <span className="text-[10px] text-white/30">{timeAgo(alert.date)}</span>
                  </div>
                  {/* Title */}
                  <p className="text-[13px] font-medium text-white/90 leading-snug group-hover:text-white transition-colors line-clamp-3">
                    {alert.title}
                  </p>
                  {/* Summary */}
                  {alert.summary && (
                    <p className="mt-1 text-[11px] text-white/40 leading-relaxed line-clamp-2">
                      {alert.summary}
                    </p>
                  )}
                  {/* Date */}
                  <p className="mt-1.5 text-[10px] text-white/25">{formatDate(alert.date)}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
          <p className="text-[10px] text-white/25 text-center">
            Data from Federal Reserve · US Treasury · White House · BLS · CBO · BEA
          </p>
        </div>
      </div>
    </>
  );
}
