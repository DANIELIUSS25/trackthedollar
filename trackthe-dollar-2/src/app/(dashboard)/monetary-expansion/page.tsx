"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { formatCompact } from "@/lib/utils/formatters";

export default function MonetaryExpansionPage() {
  // This proxy is derived from M2, Fed assets, reserves, and debt growth
  const moneySupply = useQuery({
    queryKey: ["money-supply"],
    queryFn: () => fetch("/api/v1/money-supply").then((r) => r.json()),
  });

  const d = moneySupply.data?.data;

  return (
    <main className="md:ml-sidebar space-y-6 p-4 sm:p-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold">Monetary Expansion</h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            DERIVED PROXY
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Composite signal from Fed balance sheet, M2, reserves, and debt velocity
        </p>
      </div>

      <div className="panel border-primary/20 p-4">
        <h3 className="mb-2 text-sm font-medium text-primary">How This Proxy Works</h3>
        <p className="text-sm text-muted-foreground">
          The Monetary Expansion Proxy is a composite score (0–100) derived from four components:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li><span className="font-data text-primary">35%</span> — Fed Total Assets (WALCL) z-score over 13-week rolling window</li>
          <li><span className="font-data text-primary">30%</span> — Reserve Balances (WRESBAL) z-score</li>
          <li><span className="font-data text-primary">20%</span> — M2 Money Stock growth z-score</li>
          <li><span className="font-data text-primary">15%</span> — Debt growth velocity (acceleration in public debt issuance)</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground/60">
          Higher values indicate more expansionary monetary conditions. This is a derived estimate, not a published government statistic.
        </p>
      </div>

      {moneySupply.isLoading && <LoadingState />}

      {d && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="M2 Money Stock"
              value={d.m2?.latest != null ? formatCompact(d.m2.latest * 1e9) : "—"}
              subtitle="Broad money supply"
              href="/money-supply"
            />
            <MetricCard
              label="Fed Total Assets"
              value={d.fedTotalAssets?.latest != null ? formatCompact(d.fedTotalAssets.latest * 1e6) : "—"}
              subtitle="Federal Reserve balance sheet"
              href="/money-supply"
            />
            <MetricCard
              label="Reserve Balances"
              value={d.reserveBalances?.latest != null ? formatCompact(d.reserveBalances.latest * 1e6) : "—"}
              subtitle="Bank reserves at the Fed"
              href="/money-supply"
            />
          </div>

          {d.fedTotalAssets?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.fedTotalAssets.series}
              label="Fed Total Assets (Primary Proxy Component — 35% Weight)"
              color="#f0b429"
              height={350}
              formatValue={(v) => formatCompact(v * 1e6)}
            />
          )}

          {d.m2?.series?.length > 0 && (
            <TimeSeriesChart
              data={d.m2.series}
              label="M2 Money Stock (20% Weight)"
              color="#3b82f6"
              height={300}
              formatValue={(v) => formatCompact(v * 1e9)}
            />
          )}
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
