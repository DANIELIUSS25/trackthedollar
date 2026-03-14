"use client";

import { cn } from "@/lib/utils/cn";

type StatusLevel = "live" | "recent" | "stale" | "static";

interface StatusDotProps {
  status: StatusLevel;
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<StatusLevel, { className: string; label: string }> = {
  live: { className: "status-live", label: "LIVE" },
  recent: { className: "status-recent", label: "RECENT" },
  stale: { className: "status-stale", label: "STALE" },
  static: { className: "status-static", label: "STATIC" },
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={config.className} />
      {label !== undefined ? (
        <span className="label-sm text-muted-foreground">{label}</span>
      ) : (
        <span className="label-sm text-muted-foreground">{config.label}</span>
      )}
    </span>
  );
}

export function getDataFreshness(lastUpdated: string | null | undefined): StatusLevel {
  if (!lastUpdated) return "static";
  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 1) return "live";
  if (ageHours < 24) return "recent";
  return "stale";
}
