"use client";

import { cn } from "@/lib/utils/cn";
import { SparklineChart } from "@/components/charts/SparklineChart";
import type { TimeSeriesPoint } from "@/types/dollar";

interface LiveStatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number | null;
  changePercent?: number | null;
  invertColor?: boolean;
  sparkline?: TimeSeriesPoint[];
  status?: "live" | "recent" | "stale";
  source?: string;
  className?: string;
}

export function LiveStatCard({
  label,
  value,
  subValue,
  changePercent,
  invertColor,
  sparkline,
  status = "live",
  source,
  className,
}: LiveStatCardProps) {
  const isUp = (changePercent ?? 0) > 0;
  const colorDir = invertColor ? !isUp : isUp;

  return (
    <div
      className={cn(
        "panel-hero group relative overflow-hidden p-5 transition-all duration-300 hover:shadow-panel-raised",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="label-md text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              status === "live" && "status-live",
              status === "recent" && "status-recent",
              status === "stale" && "status-stale"
            )}
          />
          {source && <span className="label-sm text-muted-foreground/60">{source}</span>}
        </div>
      </div>

      {/* Value */}
      <p className="mt-3 font-data text-data-hero font-bold tracking-tight text-foreground">
        {value}
      </p>

      {/* Sub-value + change */}
      <div className="mt-2 flex items-center gap-3">
        {subValue && (
          <span className="text-xs text-muted-foreground">{subValue}</span>
        )}
        {changePercent !== null && changePercent !== undefined && changePercent !== 0 && (
          <span
            className={cn(
              "font-data text-xs font-medium",
              colorDir ? "text-positive" : "text-negative"
            )}
          >
            {changePercent > 0 ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Background sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
          <SparklineChart
            data={sparkline}
            color={colorDir ? "#16c784" : "#ea3943"}
          />
        </div>
      )}
    </div>
  );
}
