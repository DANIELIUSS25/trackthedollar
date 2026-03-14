"use client";

import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { SparklineChart } from "@/components/charts/SparklineChart";
import type { TimeSeriesPoint } from "@/types/dollar";

interface KPIItem {
  label: string;
  value: string;
  change?: number | null;
  changePercent?: number | null;
  invertColor?: boolean | undefined;
  sparkline?: TimeSeriesPoint[];
  unit?: string;
}

interface KPIRowProps {
  items: KPIItem[];
  className?: string;
}

export function KPIRow({ items, className }: KPIRowProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        items.length <= 4
          ? "grid-cols-2 lg:grid-cols-4"
          : items.length <= 6
            ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
            : "grid-cols-2 lg:grid-cols-4 xl:grid-cols-7",
        className
      )}
    >
      {items.map((item) => (
        <KPICard key={item.label} {...item} />
      ))}
    </div>
  );
}

function KPICard({
  label,
  value,
  change,
  changePercent,
  invertColor,
  sparkline,
}: KPIItem) {
  const direction =
    change === null || change === undefined || change === 0
      ? "neutral"
      : change > 0
        ? "positive"
        : "negative";

  const colorDir = invertColor
    ? direction === "positive"
      ? "negative"
      : direction === "negative"
        ? "positive"
        : "neutral"
    : direction;

  return (
    <div className="panel flex flex-col justify-between p-3">
      <div className="flex items-center justify-between">
        <span className="label-sm text-muted-foreground">{label}</span>
        {changePercent !== null && changePercent !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              colorDir === "positive" && "bg-positive-subtle text-positive",
              colorDir === "negative" && "bg-negative-subtle text-negative",
              colorDir === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {direction === "positive" && <ArrowUpRight className="h-2.5 w-2.5" />}
            {direction === "negative" && <ArrowDownRight className="h-2.5 w-2.5" />}
            {direction === "neutral" && <Minus className="h-2.5 w-2.5" />}
            {Math.abs(changePercent).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="font-data text-data-lg font-bold leading-none text-foreground">
          {value}
        </span>
        {sparkline && sparkline.length > 1 && (
          <div className="h-8 w-16 shrink-0">
            <SparklineChart
              data={sparkline}
              color={
                colorDir === "positive"
                  ? "#16c784"
                  : colorDir === "negative"
                    ? "#ea3943"
                    : "#6b7a99"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
