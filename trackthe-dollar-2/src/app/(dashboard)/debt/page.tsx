"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { TimeSeriesPoint, DebtSnapshot } from "@/types/dollar";

interface DebtResponse {
  current: DebtSnapshot | null;
  debtToGdp: number | null;
  dailyChange: number;
  monthlyChange: number;
  yearlyChange: number;
  averageDailyIncrease30d: number;
  history: TimeSeriesPoint[];
  updatedAt: string;
}

function formatTrillions(value: number): string {
  return `$${(value / 1_000_000_000_000).toFixed(3)}T`;
}

function formatBillions(value: number): string {
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  return `$${(value / 1_000_000_000).toFixed(1)}B`;
}

export default function DebtPage() {
  const { data, isLoading, error, refetch } = useQuery<DebtResponse>({
    queryKey: ["debt"],
    queryFn: async () => {
      const res = await fetch("/api/debt");
      if (!res.ok) throw new Error("Failed to fetch debt data");
      return res.json();
    },
    refetchInterval: 300_000, // 5 minutes
    staleTime: 60_000,
  });

  return (
    <>
      <TopBar title="National Debt" subtitle="U.S. Total Public Debt Outstanding">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </TopBar>

      <Shell>
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Failed to load debt data</p>
            <button onClick={() => refetch()} className="text-xs underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Public Debt"
                value={data.current ? formatTrillions(data.current.totalPublicDebt) : "—"}
                subtitle={data.current ? `As of ${data.current.date}` : undefined}
              />
              <MetricCard
                label="Debt Held by Public"
                value={data.current ? formatTrillions(data.current.debtHeldByPublic) : "—"}
                subtitle="Marketable securities outstanding"
              />
              <MetricCard
                label="Intragovernmental"
                value={data.current ? formatTrillions(data.current.intragovernmental) : "—"}
                subtitle="Trust fund holdings (Social Security, etc.)"
              />
              <MetricCard
                label="Debt-to-GDP Ratio"
                value={data.debtToGdp ? `${data.debtToGdp.toFixed(1)}%` : "—"}
                subtitle="Federal debt as % of GDP"
                invertColor
              />
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Daily Change"
                value={data.dailyChange !== 0 ? formatBillions(data.dailyChange) : "—"}
                change={data.dailyChange}
                invertColor
              />
              <MetricCard
                label="30-Day Change"
                value={data.monthlyChange !== 0 ? formatBillions(data.monthlyChange) : "—"}
                change={data.monthlyChange}
                invertColor
              />
              <MetricCard
                label="12-Month Change"
                value={data.yearlyChange !== 0 ? formatBillions(data.yearlyChange) : "—"}
                change={data.yearlyChange}
                invertColor
              />
              <MetricCard
                label="Avg Daily Increase (30d)"
                value={
                  data.averageDailyIncrease30d !== 0
                    ? formatBillions(data.averageDailyIncrease30d)
                    : "—"
                }
                subtitle="Average daily net new borrowing"
                invertColor
              />
            </div>

            {/* Debt Trajectory Chart */}
            {data.history.length > 0 && (
              <TimeSeriesChart
                data={data.history}
                label="Total Public Debt Outstanding (12 Months)"
                color="#ea3943"
                height={400}
                formatValue={(v) => formatTrillions(v)}
              />
            )}

            {/* Composition Breakdown */}
            {data.current && (
              <div className="panel p-4">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  Debt Composition
                </h3>
                <div className="space-y-3">
                  <CompositionBar
                    label="Debt Held by Public"
                    value={data.current.debtHeldByPublic}
                    total={data.current.totalPublicDebt}
                    color="#f0b429"
                  />
                  <CompositionBar
                    label="Intragovernmental Holdings"
                    value={data.current.intragovernmental}
                    total={data.current.totalPublicDebt}
                    color="#3b82f6"
                  />
                </div>
              </div>
            )}

            {/* Data Source Note */}
            <div className="rounded-md border border-border bg-card/50 p-3">
              <p className="text-2xs text-muted-foreground">
                Data source: U.S. Treasury FiscalData API — Debt to the Penny. Updated daily on
                business days. Values represent end-of-day totals.{" "}
                {data.updatedAt && (
                  <span>Last fetched: {new Date(data.updatedAt).toLocaleString()}</span>
                )}
              </p>
            </div>
          </div>
        )}
      </Shell>
    </>
  );
}

function CompositionBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-data text-xs">{formatTrillions(value)}</span>
          <span className="text-2xs text-muted-foreground">({pct.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
