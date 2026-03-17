"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ApiWarning, NoDataState } from "@/components/shared/ApiWarning";

export default function InflationPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["inflation"],
    queryFn: () => fetch("/api/v1/inflation").then((r) => r.json()),
  });

  const d = data?.data;
  const warnings = data?.warnings ?? [];
  const hasData = d && (d.latestCpi != null || d.cpiAll?.length > 0);

  return (
    <main className="md:ml-sidebar space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Inflation</h1>
        <p className="text-sm text-muted-foreground">
          Consumer Price Index (CPI) — Bureau of Labor Statistics
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState />}
      <ApiWarning warnings={warnings} />

      {!hasData && !isLoading && !error && (
        <NoDataState message="Inflation data is not available — BLS API may be unreachable" />
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="CPI YoY Change"
              value={d.yoyChange ? `${d.yoyChange.toFixed(1)}%` : "—"}
              subtitle="Year-over-year inflation rate"
            />
            <MetricCard
              label="Latest CPI Index"
              value={d.latestCpi?.toFixed(1) ?? "—"}
              subtitle="All Items, Seasonally Adjusted"
            />
            <MetricCard
              label="Core CPI Index"
              value={d.latestCore?.toFixed(1) ?? "—"}
              subtitle="Ex Food & Energy"
            />
          </div>

          {d.cpiAll && d.cpiAll.length > 0 && (
            <TimeSeriesChart
              data={d.cpiAll}
              label="CPI — All Items (Seasonally Adjusted)"
              color="#f0b429"
              height={350}
              formatValue={(v) => v.toFixed(1)}
            />
          )}

          {d.cpiCore && d.cpiCore.length > 0 && (
            <TimeSeriesChart
              data={d.cpiCore}
              label="Core CPI — Ex Food & Energy"
              color="#3b82f6"
              height={300}
              formatValue={(v) => v.toFixed(1)}
            />
          )}

          {d.breakeven && d.breakeven.length > 0 && (
            <TimeSeriesChart
              data={d.breakeven}
              label="5-Year Breakeven Inflation Rate"
              color="#16c784"
              height={300}
              formatValue={(v) => `${v.toFixed(2)}%`}
            />
          )}

          <div className="panel p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">About These Metrics</h3>
            <p className="text-sm text-muted-foreground">
              CPI measures the average change in prices paid by urban consumers for a basket of goods
              and services. Core CPI excludes volatile food and energy prices. The 5-Year Breakeven
              Inflation Rate is derived from Treasury yields and represents market expectations for
              average inflation over the next 5 years.
            </p>
          </div>
        </>
      )}
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

function ErrorState() {
  return (
    <div className="panel border-negative/30 p-4">
      <p className="text-sm text-negative">Failed to load inflation data</p>
    </div>
  );
}
