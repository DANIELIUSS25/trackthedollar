"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SparklineChart } from "./SparklineChart";
import type { TimeSeriesPoint } from "@/types/dollar";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number | null | undefined;
  changePercent?: number | null | undefined;
  invertColor?: boolean | undefined;
  unit?: string | undefined;
  sparkline?: TimeSeriesPoint[] | undefined;
  href?: string | undefined;
  subtitle?: string | undefined;
  className?: string | undefined;
}

export function MetricCard({
  label,
  value,
  change,
  changePercent,
  invertColor = false,
  sparkline,
  href,
  subtitle,
  className,
}: MetricCardProps) {
  const direction =
    change === null || change === undefined || change === 0
      ? "neutral"
      : change > 0
        ? "positive"
        : "negative";

  const colorDirection = invertColor
    ? direction === "positive"
      ? "negative"
      : direction === "negative"
        ? "positive"
        : "neutral"
    : direction;

  const content = (
    <div
      className={cn(
        "panel flex flex-col gap-2.5 p-4 transition-all duration-standard",
        href && "cursor-pointer hover:border-primary/20 hover:shadow-panel-raised",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-md text-muted-foreground">
          {label}
        </span>
        {changePercent !== null && changePercent !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-2xs font-medium",
              colorDirection === "positive" && "bg-positive-subtle text-positive",
              colorDirection === "negative" && "bg-negative-subtle text-negative",
              colorDirection === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {direction === "positive" && <ArrowUpRight className="h-3 w-3" />}
            {direction === "negative" && <ArrowDownRight className="h-3 w-3" />}
            {direction === "neutral" && <Minus className="h-3 w-3" />}
            <span>{Math.abs(changePercent).toFixed(2)}%</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-data text-data-lg font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-2xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {sparkline && sparkline.length > 1 && (
          <div className="h-10 w-20 shrink-0">
            <SparklineChart
              data={sparkline}
              color={
                colorDirection === "positive"
                  ? "#16c784"
                  : colorDirection === "negative"
                    ? "#ea3943"
                    : "#6b7a99"
              }
            />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
