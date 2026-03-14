"use client";

import { cn } from "@/lib/utils/cn";
import { StatusDot, getDataFreshness } from "./StatusDot";

interface ConfidenceBadgeProps {
  source: string;
  lastUpdated?: string | null;
  className?: string;
}

export function ConfidenceBadge({ source, lastUpdated, className }: ConfidenceBadgeProps) {
  const freshness = getDataFreshness(lastUpdated);

  const timeLabel = lastUpdated
    ? formatRelativeTime(new Date(lastUpdated))
    : "Static";

  return (
    <span
      className={cn(
        "confidence-badge border border-border bg-surface-2 text-muted-foreground",
        className
      )}
    >
      <StatusDot status={freshness} label={timeLabel} />
      <span className="mx-0.5 text-border">|</span>
      <span className="label-sm">{source}</span>
    </span>
  );
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
