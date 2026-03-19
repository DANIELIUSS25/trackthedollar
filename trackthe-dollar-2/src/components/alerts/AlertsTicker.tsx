"use client";

import { useEffect, useRef, useState } from "react";
import type { GovAlert } from "@/lib/api/gov-alerts";
import { CATEGORY_COLORS } from "@/lib/api/gov-alerts";

interface AlertsTickerProps {
  initialAlerts?: GovAlert[];
  onOpenDrawer?: () => void;
}

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

export default function AlertsTicker({ initialAlerts = [], onOpenDrawer }: AlertsTickerProps) {
  const [alerts, setAlerts] = useState<GovAlert[]>(initialAlerts);
  const trackRef = useRef<HTMLDivElement>(null);

  // Poll every 5 min
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch("/api/v1/alerts");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setAlerts(json.data ?? []);
      } catch {}
    }
    if (initialAlerts.length === 0) refresh();
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [initialAlerts.length]);

  const visible = alerts.slice(0, 30);
  if (visible.length === 0) return null;

  return (
    <div
      className="relative w-full bg-[#0a0a0a] border-b border-white/10 overflow-hidden cursor-pointer select-none"
      style={{ height: 32 }}
      onClick={onOpenDrawer}
      title="Click to open live feed"
    >
      {/* LIVE badge */}
      <div className="absolute left-0 top-0 h-full z-10 flex items-center px-3 bg-[#0a0a0a] border-r border-white/10 gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">Live</span>
      </div>

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="absolute top-0 left-[72px] right-0 h-full flex items-center"
        style={{ overflow: "hidden" }}
      >
        <div
          className="flex items-center gap-0 whitespace-nowrap ticker-scroll"
          style={{ animation: `ticker-scroll ${visible.length * 8}s linear infinite` }}
        >
          {[...visible, ...visible].map((alert, i) => (
            <span key={`${alert.id}-${i}`} className="inline-flex items-center gap-2 mr-10">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[alert.category] }}
              />
              <span className="text-[11px] font-medium text-white/90">{alert.title}</span>
              <span className="text-[10px] text-white/40">{timeAgo(alert.date)}</span>
              <span
                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: CATEGORY_COLORS[alert.category],
                  backgroundColor: `${CATEGORY_COLORS[alert.category]}20`,
                }}
              >
                {alert.sourceLabel}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
