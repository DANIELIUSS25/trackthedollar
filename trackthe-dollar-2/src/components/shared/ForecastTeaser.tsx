"use client";

import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface Forecast {
  id: string;
  metric: string;
  current: string;
  projected: string;
  horizon: string;
  source: string;
  trend: "up" | "down";
}

interface ForecastTeaserProps {
  forecasts: Forecast[];
  className?: string;
}

export function ForecastTeaser({ forecasts, className }: ForecastTeaserProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {forecasts.map((f) => (
        <div
          key={f.id}
          className="group panel overflow-hidden p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="label-md text-muted-foreground">{f.metric}</span>
            {f.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-negative/60" />
            ) : (
              <TrendingDown className="h-4 w-4 text-positive/60" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-2xs text-muted-foreground">Now</p>
              <p className="font-data text-sm font-semibold text-foreground">{f.current}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-2xs text-muted-foreground">{f.horizon}</p>
              <p
                className={cn(
                  "font-data text-sm font-semibold",
                  f.trend === "up" ? "text-negative" : "text-positive"
                )}
              >
                {f.projected}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-border pt-2">
            <span className="text-2xs text-muted-foreground/60">{f.source}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
