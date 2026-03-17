"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ApiWarning, NoDataState } from "@/components/shared/ApiWarning";

export default function InterestRatesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["rates"],
    queryFn: () => fetch("/api/v1/rates").then((r) => r.json()),
  });

  const d = data?.data;
  const warnings = data?.warnings ?? [];
  const hasData = d && (d.fedFunds?.current != null || d.treasury10Y?.current != null);

  return (
    <main className="md:ml-sidebar space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Interest Rates</h1>
        <p className="text-sm text-muted-foreground">
          Federal Funds Rate and Treasury Yields — FRED
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState />}
      <ApiWarning warnings={warnings} />

      {hasData && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard
              label="Fed Funds Rate"
              value={d.fedFunds?.current != null ? `${d.fedFunds.current.toFixed(2)}%` : "—"}
              subtitle="Effective rate (DFF)"
            />
            <MetricCard
              label="2-Year Treasury"
              value={d.treasury2Y?.current != null ? `${d.treasury2Y.current.toFixed(2)}%` : "—"}
              subtitle="Constant maturity (DGS2)"
            />
            <MetricCard
              label="10-Year Treasury"
              value={d.treasury10Y?.current != null ? `${d.treasury10Y.current.toFixed(2)}%` : "—"}
              subtitle="Constant maturity (DGS10)"
            />
            <MetricCard
              label="Yield Curve (10Y-2Y)"
              value={d.yieldCurveSpread != null ? `${(d.yieldCurveSpread * 100).toFixed(0)} bps` : "—"}
              subtitle={d.yieldCurveSpread != null && d.yieldCurveSpread < 0 ? "INVERTED" : "Normal"}
            />
          </div>

          {d.fedFunds?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.fedFunds.series}
              label="Federal Funds Effective Rate"
              color="#f0b429"
              height={300}
              formatValue={(v: number) => `${v.toFixed(2)}%`}
            />
          )}

          {d.treasury10Y?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.treasury10Y.series}
              label="10-Year Treasury Yield"
              color="#3b82f6"
              height={300}
              formatValue={(v: number) => `${v.toFixed(2)}%`}
            />
          )}

          {d.treasury2Y?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.treasury2Y.series}
              label="2-Year Treasury Yield"
              color="#16c784"
              height={300}
              formatValue={(v: number) => `${v.toFixed(2)}%`}
            />
          )}
        </>
      )}

      {!hasData && !isLoading && !error && (
        <NoDataState
          message="Interest rate data is not available"
          requiresFredKey
        />
      )}

      <div className="panel p-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">About Interest Rates</h3>
        <p className="text-sm text-muted-foreground">
          The Federal Funds Rate is the interest rate at which depository institutions lend reserve
          balances overnight. Treasury yields represent the return on U.S. government bonds at
          various maturities. The yield curve spread (10Y minus 2Y) is a widely watched recession
          indicator — an inverted curve has preceded every U.S. recession since the 1970s.
        </p>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="panel h-28 animate-pulse bg-surface-1" />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="panel border-negative/30 p-4">
      <p className="text-sm text-negative">Failed to load interest rate data</p>
    </div>
  );
}
