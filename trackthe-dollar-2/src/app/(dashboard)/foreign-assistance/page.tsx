"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { formatCompact } from "@/lib/utils/formatters";

export default function ForeignAssistancePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["foreign-assistance"],
    queryFn: () => fetch("/api/v1/foreign-assistance").then((r) => r.json()),
  });

  const d = data?.data;

  return (
    <main className="md:ml-sidebar space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Foreign Assistance</h1>
        <p className="text-sm text-muted-foreground">
          U.S. foreign aid obligations and disbursements — USAID
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState />}

      {d && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MetricCard
              label="Total Obligations"
              value={
                d.totalObligations?.length > 0
                  ? formatCompact(d.totalObligations[d.totalObligations.length - 1].value)
                  : "—"
              }
              subtitle="Latest fiscal year"
            />
            <MetricCard
              label="Total Disbursements"
              value={
                d.totalDisbursements?.length > 0
                  ? formatCompact(d.totalDisbursements[d.totalDisbursements.length - 1].value)
                  : "—"
              }
              subtitle="Latest fiscal year"
            />
          </div>

          {d.totalObligations?.length > 0 && (
            <TimeSeriesChart
              data={d.totalObligations}
              label="Foreign Assistance — Total Obligations by Fiscal Year"
              color="#f0b429"
              height={350}
              formatValue={formatCompact}
            />
          )}

          {d.totalDisbursements?.length > 0 && (
            <TimeSeriesChart
              data={d.totalDisbursements}
              label="Foreign Assistance — Total Disbursements by Fiscal Year"
              color="#16c784"
              height={300}
              formatValue={formatCompact}
            />
          )}

          {d.topCountries?.length > 0 && (
            <div className="panel p-4">
              <h3 className="mb-3 text-sm font-medium text-foreground">Top Recipient Countries</h3>
              <div className="space-y-2">
                {d.topCountries.map((c: { country: string; amount: number }, i: number) => (
                  <div key={c.country} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="mr-2 font-data text-primary">{String(i + 1).padStart(2, "0")}</span>
                      {c.country}
                    </span>
                    <span className="font-data text-foreground">{formatCompact(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">About Foreign Assistance</h3>
            <p className="text-sm text-muted-foreground">
              Data from USAID Open Data portal (data.usaid.gov). Covers all U.S. government foreign
              assistance including economic, military, and humanitarian aid. Obligations represent
              committed funds; disbursements represent actual payments made.
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="panel h-28 animate-pulse bg-surface-1" />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="panel border-negative/30 p-4">
      <p className="text-sm text-negative">Failed to load foreign assistance data</p>
    </div>
  );
}
