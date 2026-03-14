"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TickerItem {
  label: string;
  value: string;
  change?: number | null;
  changeFormatted?: string;
}

interface TickerStripProps {
  items: TickerItem[];
  className?: string;
}

export function TickerStrip({ items, className }: TickerStripProps) {
  // Duplicate items for seamless infinite scroll
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "ticker-container mask-fade-x border-b border-border bg-card/60 backdrop-blur-sm",
        className
      )}
    >
      <div className="ticker-track flex items-center whitespace-nowrap py-2">
        {doubled.map((item, i) => (
          <div key={`${item.label}-${i}`} className="flex items-center">
            <div className="flex items-center gap-2 px-5">
              <span className="label-sm text-muted-foreground">{item.label}</span>
              <span className="font-data text-xs font-medium text-foreground">
                {item.value}
              </span>
              {item.change !== null && item.change !== undefined && item.change !== 0 && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-data text-2xs font-medium",
                    item.change > 0 ? "text-positive" : "text-negative"
                  )}
                >
                  {item.change > 0 ? (
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5" />
                  )}
                  {item.changeFormatted ?? `${Math.abs(item.change).toFixed(2)}%`}
                </span>
              )}
            </div>
            <div className="h-3 w-px bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
