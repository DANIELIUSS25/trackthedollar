"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { formatCompact } from "@/lib/utils/formatters";

export default function MoneySupplyPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["money-supply"],
    queryFn: () => fetch("/api/v1/money-supply").then((r) => r.json()),
  });

  const d = data?.data;

  return (
    <main className="ml-sidebar space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Money Supply</h1>
        <p className="text-sm text-muted-foreground">
          M2, Fed Total Assets, and Reserve Balances — Federal Reserve
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState />}

      {d && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="M2 Money Stock"
              value={d.m2?.latest != null ? formatCompact(d.m2.latest * 1e9) : "—"}
              subtitle={`Series: ${d.m2?.seriesId ?? "M2SL"}`}
            />
            <MetricCard
              label="Fed Total Assets"
              value={d.fedTotalAssets?.latest != null ? formatCompact(d.fedTotalAssets.latest * 1e6) : "—"}
              subtitle={`Series: ${d.fedTotalAssets?.seriesId ?? "WALCL"}`}
            />
            <MetricCard
              label="Reserve Balances"
              value={d.reserveBalances?.latest != null ? formatCompact(d.reserveBalances.latest * 1e6) : "—"}
              subtitle={`Series: ${d.reserveBalances?.seriesId ?? "WRESBAL"}`}
            />
          </div>

          {d.m2?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.m2.series}
              label="M2 Money Stock (Billions)"
              color="#f0b429"
              height={350}
              formatValue={(v) => formatCompact(v * 1e9)}
            />
          )}

          {d.fedTotalAssets?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.fedTotalAssets.series}
              label="Federal Reserve Total Assets (Millions)"
              color="#3b82f6"
              height={300}
              formatValue={(v) => formatCompact(v * 1e6)}
            />
          )}

          {d.reserveBalances?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.reserveBalances.series}
              label="Reserve Balances with Federal Reserve (Millions)"
              color="#16c784"
              height={300}
              formatValue={(v) => formatCompact(v * 1e6)}
            />
          )}

          <div className="panel p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">About Money Supply</h3>
            <p className="text-sm text-muted-foreground">
              M2 includes currency, checking deposits, savings, money market funds, and small time
              deposits. Fed Total Assets (WALCL) reflects the Federal Reserve&apos;s balance sheet —
              expanding during QE, contracting during QT. Reserve Balances show how much commercial
              banks hold at the Fed, a key indicator of banking system liquidity.
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
      <p className="text-sm text-negative">Failed to load money supply data</p>
    </div>
  );
}
