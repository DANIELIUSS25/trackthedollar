"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LiquidityMetricData {
  value: number;
  change?: number | null;
  changePercent?: number | null;
  series: Array<{ date: string; value: number | null }>;
  lastUpdated?: string | null;
  date?: string | null;
}

interface LiquidityResponse {
  fedBalanceSheet: LiquidityMetricData;
  tga: LiquidityMetricData;
  rrp: LiquidityMetricData;
  netLiquidity: { value: number; series: Array<{ date: string; value: number }> };
  m2: LiquidityMetricData;
  updatedAt: string;
}

function formatBillions(v: number): string {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(2)}T`;
  return `$${v.toFixed(0)}B`;
}

export default function LiquidityPage() {
  const { data, isLoading, error, refetch } = useQuery<LiquidityResponse>({
    queryKey: ["liquidity"],
    queryFn: async () => {
      const res = await fetch("/api/liquidity");
      if (!res.ok) throw new Error("Failed to fetch liquidity data");
      return res.json();
    },
    refetchInterval: 300_000,
    staleTime: 60_000,
  });

  return (
    <>
      <TopBar title="Liquidity & Fed" subtitle="Federal Reserve Balance Sheet, TGA, Reverse Repo">
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
            <p className="text-sm">Failed to load liquidity data</p>
            <button onClick={() => refetch()} className="text-xs underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Net Liquidity Formula */}
            <div className="panel bg-gradient-to-r from-card to-card/80 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Liquidity Formula
              </h3>
              <div className="flex flex-wrap items-center gap-2 font-data text-lg">
                <span className="text-foreground">Net Liquidity</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-primary">Fed Balance Sheet</span>
                <span className="text-muted-foreground">−</span>
                <span className="text-blue-400">TGA</span>
                <span className="text-muted-foreground">−</span>
                <span className="text-purple-400">RRP</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-data text-2xl font-bold">
                <span className="text-foreground">
                  {formatBillions(data.netLiquidity.value)}
                </span>
                <span className="text-muted-foreground">=</span>
                <span className="text-primary">
                  {formatBillions(data.fedBalanceSheet.value)}
                </span>
                <span className="text-muted-foreground">−</span>
                <span className="text-blue-400">
                  {formatBillions(data.tga.value)}
                </span>
                <span className="text-muted-foreground">−</span>
                <span className="text-purple-400">
                  {formatBillions(data.rrp.value)}
                </span>
              </div>
              <p className="mt-2 text-2xs text-muted-foreground">
                Net liquidity approximates the total available liquidity in the financial system.
                When the Fed shrinks its balance sheet (QT), or when the TGA fills up (Treasury
                borrowing), or when RRP usage rises, net liquidity decreases.
              </p>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Fed Balance Sheet"
                value={formatBillions(data.fedBalanceSheet.value)}
                change={data.fedBalanceSheet.change}
                changePercent={data.fedBalanceSheet.changePercent}
                sparkline={data.fedBalanceSheet.series
                  .filter((p): p is { date: string; value: number } => p.value !== null)
                  .map((p) => ({ date: p.date, value: p.value / 1000 }))}
                subtitle={data.fedBalanceSheet.lastUpdated ?? undefined}
              />
              <MetricCard
                label="Treasury General Account"
                value={formatBillions(data.tga.value)}
                sparkline={data.tga.series
                  .filter((p): p is { date: string; value: number } => p.value !== null)}
                subtitle={data.tga.date ?? undefined}
              />
              <MetricCard
                label="Reverse Repo (RRP)"
                value={formatBillions(data.rrp.value)}
                change={data.rrp.change}
                changePercent={data.rrp.changePercent}
                sparkline={data.rrp.series
                  .filter((p): p is { date: string; value: number } => p.value !== null)}
                subtitle={data.rrp.lastUpdated ?? undefined}
              />
              <MetricCard
                label="M2 Money Supply"
                value={
                  data.m2.value
                    ? `$${((data.m2.value as number) / 1000).toFixed(2)}T`
                    : "—"
                }
                change={data.m2.change}
                changePercent={data.m2.changePercent}
                sparkline={data.m2.series
                  .filter((p): p is { date: string; value: number } => p.value !== null)}
                subtitle={data.m2.lastUpdated ?? undefined}
              />
            </div>

            {/* Charts */}
            {data.netLiquidity.series.length > 0 && (
              <TimeSeriesChart
                data={data.netLiquidity.series}
                label="Net Liquidity (Fed BS − TGA − RRP)"
                color="#f0b429"
                height={350}
                formatValue={(v) => formatBillions(v)}
              />
            )}

            {data.fedBalanceSheet.series.length > 0 && (
              <TimeSeriesChart
                data={data.fedBalanceSheet.series
                  .filter((p): p is { date: string; value: number } => p.value !== null)
                  .map((p) => ({ date: p.date, value: p.value / 1000 }))}
                label="Federal Reserve Total Assets (WALCL)"
                color="#16c784"
                height={300}
                formatValue={(v) => formatBillions(v)}
              />
            )}

            {data.tga.series.length > 0 && (
              <TimeSeriesChart
                data={data.tga.series.filter(
                  (p): p is { date: string; value: number } => p.value !== null
                )}
                label="Treasury General Account (TGA)"
                color="#3b82f6"
                height={300}
                formatValue={(v) => formatBillions(v)}
              />
            )}

            {data.rrp.series.length > 0 && (
              <TimeSeriesChart
                data={data.rrp.series.filter(
                  (p): p is { date: string; value: number } => p.value !== null
                )}
                label="Overnight Reverse Repo Facility"
                color="#8b5cf6"
                height={300}
                formatValue={(v) => formatBillions(v)}
              />
            )}

            {/* Explainer */}
            <div className="panel p-4">
              <h3 className="mb-3 text-sm font-medium text-foreground">
                How Liquidity Flows Work
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ExplainerCard
                  title="Fed Balance Sheet (WALCL)"
                  description="The total assets held by the Federal Reserve. During QE, the Fed buys Treasuries and MBS, expanding its balance sheet and injecting reserves into the banking system. During QT, the opposite occurs."
                  color="text-primary"
                />
                <ExplainerCard
                  title="Treasury General Account (TGA)"
                  description="The U.S. government's checking account at the Fed. When Treasury issues debt, cash flows into the TGA (draining bank reserves). When Treasury spends, cash flows out of the TGA back into the economy."
                  color="text-blue-400"
                />
                <ExplainerCard
                  title="Reverse Repo Facility (RRP)"
                  description="A facility where money market funds and other counterparties park excess cash at the Fed overnight. High RRP usage indicates excess liquidity seeking safe returns. As RRP drains, that liquidity re-enters the market."
                  color="text-purple-400"
                />
              </div>
            </div>

            {/* Source */}
            <div className="rounded-md border border-border bg-card/50 p-3">
              <p className="text-2xs text-muted-foreground">
                Data sources: Federal Reserve (FRED: WALCL, RRPONTSYD, M2SL), U.S. Treasury
                FiscalData API (Daily Treasury Statement). Net Liquidity is a calculated composite.{" "}
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

function ExplainerCard({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background/50 p-3">
      <h4 className={`mb-1 text-xs font-semibold ${color}`}>{title}</h4>
      <p className="text-2xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
