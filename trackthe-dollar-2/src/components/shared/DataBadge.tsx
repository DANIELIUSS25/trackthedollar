"use client";
// src/components/shared/DataBadge.tsx
import { cn } from "@/lib/utils/cn";
import { formatPercent, formatChange } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataBadgeProps {
  value: number;
  type?: "percent" | "change";
  showIcon?: boolean;
  className?: string;
}

export function DataBadge({ value, type = "percent", showIcon = true, className }: DataBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const formatted = type === "percent"
    ? formatPercent(value, false)
    : formatChange(value);

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-data text-sm tabular-nums",
        isPositive && "text-positive",
        isNegative && "text-negative",
        isNeutral && "text-muted-foreground",
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {formatted}
    </span>
  );
}
