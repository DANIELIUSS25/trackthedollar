"use client";

import { cn } from "@/lib/utils/cn";
import { ArrowRight, ArrowDown } from "lucide-react";

interface FlowNode {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DollarFlowDiagramProps {
  sources: FlowNode[];
  destinations: FlowNode[];
  tga: number;
  className?: string;
}

function formatTrillion(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}

export function DollarFlowDiagram({
  sources,
  destinations,
  tga,
  className,
}: DollarFlowDiagramProps) {
  const totalIn = sources.reduce((sum, s) => sum + s.value, 0);
  const totalOut = destinations.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={cn("panel p-6", className)}>
      <h3 className="mb-6 text-sm font-medium text-foreground">Dollar Flow — Annual System View</h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Sources Column */}
        <div className="space-y-2">
          <p className="label-md mb-3 text-muted-foreground">Inflows</p>
          {sources.map((s) => (
            <FlowBar
              key={s.id}
              label={s.label}
              value={s.value}
              maxValue={totalIn}
              color={s.color}
            />
          ))}
          <div className="mt-3 border-t border-border pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Inflows</span>
              <span className="font-data font-medium text-foreground">
                {formatTrillion(totalIn)}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden items-center lg:flex">
          <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <div className="flex items-center justify-center lg:hidden">
          <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
        </div>

        {/* TGA Center */}
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-6 text-center">
            <p className="label-sm text-primary">Treasury General Account</p>
            <p className="mt-2 font-data text-data-xl font-bold text-foreground">
              {formatTrillion(tga)}
            </p>
            <p className="mt-1 text-2xs text-muted-foreground">Operating cash balance</p>
          </div>
          <div className="my-2 h-6 w-px bg-border lg:hidden" />
        </div>

        {/* Arrow */}
        <div className="hidden items-center lg:flex">
          <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <div className="flex items-center justify-center lg:hidden">
          <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
        </div>

        {/* Destinations Column */}
        <div className="space-y-2">
          <p className="label-md mb-3 text-muted-foreground">Outflows</p>
          {destinations.map((d) => (
            <FlowBar
              key={d.id}
              label={d.label}
              value={d.value}
              maxValue={totalOut}
              color={d.color}
            />
          ))}
          <div className="mt-3 border-t border-border pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Outflows</span>
              <span className="font-data font-medium text-foreground">
                {formatTrillion(totalOut)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Flow Indicator */}
      <div className="mt-6 rounded-lg bg-surface-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Net Annual Gap (Outflows − Tax Receipts)
          </span>
          <span className="font-data text-sm font-semibold text-negative">
            -$1.83T
          </span>
        </div>
        <p className="mt-1 text-2xs text-muted-foreground">
          This gap is funded by new Treasury issuance, adding to the national debt.
        </p>
      </div>
    </div>
  );
}

function FlowBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = (value / maxValue) * 100;

  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-foreground/80">{label}</span>
        <span className="font-data text-xs font-medium text-foreground">
          {formatTrillion(value)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}
