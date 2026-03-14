"use client";

import { ArrowUpRight, ArrowDownRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DailyChange {
  id: string;
  metric: string;
  direction: "up" | "down" | "neutral";
  magnitude: string;
  context: string;
  invertSentiment?: boolean;
}

interface WhatChangedTodayProps {
  changes: DailyChange[];
  className?: string;
}

export function WhatChangedToday({ changes, className }: WhatChangedTodayProps) {
  if (changes.length === 0) return null;

  return (
    <div className={cn("panel p-4", className)}>
      <h2 className="label-lg mb-3 text-muted-foreground">What Changed Today</h2>
      <div className="space-y-2">
        {changes.map((change) => {
          const isPositiveSentiment = change.invertSentiment
            ? change.direction === "down"
            : change.direction === "up";
          const isNegativeSentiment = change.invertSentiment
            ? change.direction === "up"
            : change.direction === "down";

          return (
            <div
              key={change.id}
              className="flex items-start gap-3 rounded-md border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-surface-2"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  isPositiveSentiment && "bg-positive-subtle",
                  isNegativeSentiment && "bg-negative-subtle",
                  change.direction === "neutral" && "bg-muted"
                )}
              >
                {change.direction === "up" && (
                  <ArrowUpRight
                    className={cn(
                      "h-3 w-3",
                      isPositiveSentiment ? "text-positive" : "text-negative"
                    )}
                  />
                )}
                {change.direction === "down" && (
                  <ArrowDownRight
                    className={cn(
                      "h-3 w-3",
                      isNegativeSentiment ? "text-negative" : "text-positive"
                    )}
                  />
                )}
                {change.direction === "neutral" && (
                  <Circle className="h-2 w-2 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{change.metric}</span>{" "}
                  <span className="font-data font-medium">
                    {change.direction === "up" ? "+" : change.direction === "down" ? "" : ""}
                    {change.magnitude}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{change.context}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
