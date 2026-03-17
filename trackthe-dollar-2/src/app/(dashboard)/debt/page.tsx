"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw } from "lucide-react";

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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["debt-v1"],
    queryFn: async () => {
      const res = await fetch("/api/v1/debt");
      if (!res.ok) throw new Error("Failed to fetch debt data");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 300_000,
    staleTime: 60_000,
  });

  return (
    <>
      <TopBar title="National Debt" subtitle="U.S. Total Public Debt Outstanding — Treasury Fiscal Data">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Public Debt"
                value={data.totalDebt ? formatTrillions(data.totalDebt) : "—"}
                subtitle={data.lastDate ? `As of ${data.lastDate}` : undefined}
              />
              <MetricCard
                label="Debt Held by Public"
                value={data.debtHeldByPublic ? formatTrillions(data.debtHeldByPublic) : "—"}
                subtitle="Marketable securities outstanding"
              />
              <MetricCard
                label="Intragovernmental"
                value={data.intragovernmental ? formatTrillions(data.intragovernmental) : "—"}
                subtitle="Trust fund holdings"
              />
              <MetricCard
                label="Daily Change"
                value={data.dailyChange ? formatBillions(data.dailyChange) : "—"}
                change={data.dailyChange}
                changePercent={data.changePercent}
                invertColor
              />
            </div>

            {data.series?.length > 0 && (
              <TimeSeriesChart
                data={data.series}
                label="Total Public Debt Outstanding"
                color="#ea3943"
                height={400}
                formatValue={(v) => formatTrillions(v)}
              />
            )}

            {data.totalDebt && data.debtHeldByPublic && data.intragovernmental && (
              <div className="panel p-4">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  Debt Composition
                </h3>
                <div className="space-y-3">
                  <CompositionBar
                    label="Debt Held by Public"
                    value={data.debtHeldByPublic}
                    total={data.totalDebt}
                    color="#f0b429"
                  />
                  <CompositionBar
                    label="Intragovernmental Holdings"
                    value={data.intragovernmental}
                    total={data.totalDebt}
                    color="#3b82f6"
                  />
                </div>
              </div>
            )}

            <div className="rounded-md border border-border bg-card/50 p-3">
              <p className="text-2xs text-muted-foreground">
                Data source: {data.source ?? "U.S. Treasury FiscalData API"} — Debt to the Penny.
                Updated daily on business days. Values represent end-of-day totals.
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
