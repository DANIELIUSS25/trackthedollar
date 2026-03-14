"use client";

import { cn } from "@/lib/utils/cn";
import { StatusDot, getDataFreshness } from "./StatusDot";
import { Shield, Clock, Wifi } from "lucide-react";

interface SourceEntry {
  source: string;
  frequency: string;
  lastUpdate: string;
  reliability: "high" | "medium" | "low";
  latencyMs: number;
  coverage: string;
}

interface SourceConfidencePanelProps {
  sources: SourceEntry[];
  className?: string;
}

const RELIABILITY_STYLES = {
  high: "bg-positive-subtle text-positive",
  medium: "bg-warning-subtle text-warning",
  low: "bg-negative-subtle text-negative",
};

export function SourceConfidencePanel({ sources, className }: SourceConfidencePanelProps) {
  return (
    <div className={cn("panel p-4", className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Source Confidence</h2>
      </div>

      <div className="space-y-3">
        {sources.map((s) => {
          const freshness = getDataFreshness(s.lastUpdate);
          return (
            <div
              key={s.source}
              className="rounded-lg border border-border bg-surface-2/50 p-3 transition-colors hover:border-border"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{s.source}</p>
                  <p className="mt-0.5 text-2xs text-muted-foreground">{s.coverage}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-2xs font-medium uppercase",
                    RELIABILITY_STYLES[s.reliability]
                  )}
                >
                  {s.reliability}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-2xs text-muted-foreground">{s.frequency}</span>
                </div>
                {s.latencyMs > 0 && (
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-2xs text-muted-foreground">{s.latencyMs}ms</span>
                  </div>
                )}
                <StatusDot status={freshness} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
