"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { formatCompact } from "@/lib/utils/formatters";

export default function WarSpendingPage() {
  const defense = useQuery({
    queryKey: ["defense-spending"],
    queryFn: () => fetch("/api/v1/defense-spending").then((r) => r.json()),
  });
  const foreignAid = useQuery({
    queryKey: ["foreign-assistance"],
    queryFn: () => fetch("/api/v1/foreign-assistance").then((r) => r.json()),
  });

  const dd = defense.data?.data;
  const fa = foreignAid.data?.data;

  return (
    <main className="md:ml-sidebar space-y-6 p-4 sm:p-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold">War Spending</h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            DERIVED PROXY
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Composite signal from DoD spending and security assistance flows
        </p>
      </div>

      <div className="panel border-primary/20 p-4">
        <h3 className="mb-2 text-sm font-medium text-primary">How This Proxy Works</h3>
        <p className="text-sm text-muted-foreground">
          The War Spending Proxy is a composite score (0–100) derived from three components:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li><span className="font-data text-primary">45%</span> — DoD obligations growth z-score (year-over-year)</li>
          <li><span className="font-data text-primary">20%</span> — Contract share of DoD awards z-score</li>
          <li><span className="font-data text-primary">35%</span> — Security assistance (foreign military aid) growth z-score</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground/60">
          Higher values indicate elevated defense/military spending activity. This is a derived estimate, not a published government statistic.
        </p>
      </div>

      {(defense.isLoading || foreignAid.isLoading) && <LoadingState />}

      {dd && (
        <>
          <h2 className="text-lg font-semibold">Defense Component (65% Weight)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="DoD Obligations"
              value={
                dd.obligations?.length > 0
                  ? formatCompact(dd.obligations[dd.obligations.length - 1].value)
                  : "—"
              }
              subtitle="Latest fiscal year"
              href="/defense"
            />
            <MetricCard
              label="DoD Outlays"
              value={
                dd.outlays?.length > 0
                  ? formatCompact(dd.outlays[dd.outlays.length - 1].value)
                  : "—"
              }
              subtitle="Actual expenditures"
              href="/defense"
            />
            <MetricCard
              label="Budgetary Resources"
              value={
                dd.budgetaryResources?.length > 0
                  ? formatCompact(dd.budgetaryResources[dd.budgetaryResources.length - 1].value)
                  : "—"
              }
              subtitle="Total DoD funding"
              href="/defense"
            />
          </div>

          {dd.obligations?.length > 0 && (
            <TimeSeriesChart
              data={dd.obligations}
              label="DoD Obligations (45% Proxy Weight)"
              color="#ea3943"
              height={300}
              formatValue={formatCompact}
            />
          )}
        </>
      )}

      {fa && (
        <>
          <h2 className="text-lg font-semibold">Security Assistance Component (35% Weight)</h2>
          {fa.totalObligations?.length > 0 && (
            <TimeSeriesChart
              data={fa.totalObligations}
              label="Foreign Assistance — Total Obligations"
              color="#f0b429"
              height={300}
              formatValue={formatCompact}
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
