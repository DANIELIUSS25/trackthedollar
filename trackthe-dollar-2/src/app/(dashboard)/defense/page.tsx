"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { formatCompact } from "@/lib/utils/formatters";

export default function DefenseSpendingPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["defense-spending"],
    queryFn: () => fetch("/api/v1/defense-spending").then((r) => r.json()),
  });

  const d = data?.data;

  return (
    <main className="md:ml-sidebar space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Defense Spending</h1>
        <p className="text-sm text-muted-foreground">
          Department of Defense obligations and outlays — USAspending.gov
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState />}

      {d && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Budgetary Resources"
              value={
                d.budgetaryResources?.length > 0
                  ? formatCompact(d.budgetaryResources[d.budgetaryResources.length - 1].value)
                  : "—"
              }
              subtitle="Latest fiscal year"
            />
            <MetricCard
              label="Total Obligations"
              value={
                d.obligations?.length > 0
                  ? formatCompact(d.obligations[d.obligations.length - 1].value)
                  : "—"
              }
              subtitle="Committed spending"
            />
            <MetricCard
              label="Total Outlays"
              value={
                d.outlays?.length > 0
                  ? formatCompact(d.outlays[d.outlays.length - 1].value)
                  : "—"
              }
              subtitle="Actual expenditures"
            />
          </div>

          {d.budgetaryResources?.length > 0 && (
            <TimeSeriesChart
              data={d.budgetaryResources}
              label="DoD Budgetary Resources by Fiscal Year"
              color="#10b981"
              height={350}
              formatValue={formatCompact}
            />
          )}

          {d.obligations?.length > 0 && (
            <TimeSeriesChart
              data={d.obligations}
              label="DoD Obligations by Fiscal Year"
              color="#ea3943"
              height={300}
              formatValue={formatCompact}
            />
          )}

          <div className="panel p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">About Defense Spending</h3>
            <p className="text-sm text-muted-foreground">
              Data from USAspending.gov covers the Department of Defense (Agency 097). Budgetary
              resources represent total funding available. Obligations are legally binding commitments.
              Outlays are actual cash disbursements. Data is reported by fiscal year (Oct 1 - Sep 30).
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
      <p className="text-sm text-negative">Failed to load defense spending data</p>
    </div>
  );
}
