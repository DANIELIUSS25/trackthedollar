"use client";

import { cn } from "@/lib/utils/cn";
import { StatusDot, getDataFreshness } from "@/components/shared/StatusDot";

interface HeroStatProps {
  label: string;
  value: string;
  subValue?: string;
  source?: string;
  lastUpdated?: string | null;
  className?: string;
}

export function HeroStat({
  label,
  value,
  subValue,
  source,
  lastUpdated,
  className,
}: HeroStatProps) {
  const freshness = getDataFreshness(lastUpdated);

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <span className="label-md mb-2 text-muted-foreground">{label}</span>
      <span className="font-data text-data-hero font-semibold tracking-tight text-foreground">
        {value}
      </span>
      {subValue && (
        <span className="mt-1 font-data text-xs text-muted-foreground">{subValue}</span>
      )}
      {source && (
        <div className="mt-2">
          <StatusDot status={freshness} label={source} />
        </div>
      )}
    </div>
  );
}
