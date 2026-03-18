"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ApiWarning, NoDataState } from "@/components/shared/ApiWarning";

export default function DollarStrengthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dollar-strength"],
    queryFn: () => fetch("/api/v1/dollar-strength").then((r) => r.json()),
  });

  const d = data?.data;
  const warnings = data?.warnings ?? [];

  return (
    <main className="md:ml-sidebar space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dollar Strength</h1>
        <p className="text-sm text-muted-foreground">
          Trade-Weighted Broad Dollar Index (DTWEXBGS) — Federal Reserve
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message="Failed to load dollar strength data" />}
      <ApiWarning warnings={warnings} />

      {d && d.current != null && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Dollar Index"
              value={d.current?.toFixed(2) ?? "—"}
              change={d.change}
              changePercent={d.changePercent}
              subtitle={`Source: ${d.source}`}
            />
            <MetricCard
              label="Daily Change"
              value={d.change?.toFixed(2) ?? "—"}
              changePercent={d.changePercent}
              subtitle="vs. previous observation"
            />
            <MetricCard
              label="Series ID"
              value={d.seriesId ?? "DTWEXBGS"}
              subtitle="FRED / Federal Reserve"
            />
          </div>

          {d.series && d.series.length > 0 && (
            <TimeSeriesChart
              data={d.series}
              label="Trade-Weighted Dollar Index — Historical"
              color="#f0b429"
              height={400}
              formatValue={(v: number) => v.toFixed(1)}
            />
          )}
        </>
      )}

      {d && d.current == null && !isLoading && (
        <NoDataState
          message="Dollar strength data is not available"
          requiresFredKey
        />
      )}

      <div className="panel p-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">About This Metric</h3>
        <p className="text-sm text-muted-foreground">
          The Trade-Weighted U.S. Dollar Index (Broad) measures the value of the U.S. dollar
          relative to currencies of a broad group of major U.S. trading partners. A higher value
          indicates a stronger dollar. Published by the Federal Reserve Board of Governors.
        </p>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="panel h-28 animate-pulse bg-surface-1" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="panel border-negative/30 p-4">
      <p className="text-sm text-negative">{message}</p>
    </div>
  );
}
