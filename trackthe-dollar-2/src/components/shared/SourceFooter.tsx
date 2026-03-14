"use client";

import { cn } from "@/lib/utils/cn";
import { StatusDot, getDataFreshness } from "./StatusDot";

interface SourceFooterProps {
  sources: string[];
  lastFetched?: string | null;
  methodology?: string;
  className?: string;
}

export function SourceFooter({ sources, lastFetched, methodology, className }: SourceFooterProps) {
  const freshness = getDataFreshness(lastFetched);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border bg-surface-2/50 px-4 py-2.5",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="label-sm text-muted-foreground">Sources:</span>
        <span className="text-2xs text-muted-foreground">{sources.join(" · ")}</span>
      </div>
      {lastFetched && (
        <div className="flex items-center gap-1.5">
          <StatusDot
            status={freshness}
            label={`Updated ${new Date(lastFetched).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}`}
          />
        </div>
      )}
      {methodology && (
        <span className="text-2xs text-muted-foreground/70">{methodology}</span>
      )}
    </div>
  );
}
