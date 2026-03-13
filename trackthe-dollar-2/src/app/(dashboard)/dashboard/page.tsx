"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw, TrendingUp, Landmark, Droplets, Receipt } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  change: number | null;
  changePercent: number | null;
  changeDirection: "positive" | "negative" | "neutral";
  invertColor?: boolean;
  unit: string;
  sparkline: Array<{ date: string; value: number }>;
  source: string;
  lastUpdated: string;
  href: string;
}

interface OverviewResponse {
  metrics: OverviewMetric[];
  lastRefreshed: string;
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery<OverviewResponse>({
    queryKey: ["overview"],
    queryFn: async () => {
      const res = await fetch("/api/overview");
      if (!res.ok) throw new Error("Failed to fetch overview");
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="U.S. Dollar System Overview"
      >
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
        {dataUpdatedAt > 0 && (
          <span className="text-2xs text-muted-foreground">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </span>
        )}
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
            <p className="text-sm">Failed to load dashboard data</p>
            <button
              onClick={() => refetch()}
              className="text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Section: Dollar System Vitals */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Dollar System Vitals
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {data.metrics
                  .filter((m) =>
                    ["total_debt", "fed_balance_sheet", "tga", "rrp", "net_liquidity"].includes(m.id)
                  )
                  .map((metric) => (
                    <MetricCard
                      key={metric.id}
                      label={metric.label}
                      value={metric.formattedValue}
                      change={metric.change}
                      changePercent={metric.changePercent}
                      invertColor={metric.invertColor}
                      sparkline={metric.sparkline}
                      href={metric.href}
                      subtitle={`Source: ${metric.source} · ${metric.lastUpdated ? new Date(metric.lastUpdated).toLocaleDateString() : "—"}`}
                    />
                  ))}
              </div>
            </section>

            {/* Section: Rates & Yields */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Rates & Yields
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.metrics
                  .filter((m) =>
                    ["fed_funds", "dgs10", "yield_curve"].includes(m.id)
                  )
                  .map((metric) => (
                    <MetricCard
                      key={metric.id}
                      label={metric.label}
                      value={metric.formattedValue}
                      change={metric.change}
                      changePercent={metric.changePercent}
                      sparkline={metric.sparkline}
                      href={metric.href}
                    />
                  ))}
              </div>
            </section>

            {/* Section: Money & Inflation */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Money & Inflation
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.metrics
                  .filter((m) => ["m2", "cpi"].includes(m.id))
                  .map((metric) => (
                    <MetricCard
                      key={metric.id}
                      label={metric.label}
                      value={metric.formattedValue}
                      change={metric.change}
                      changePercent={metric.changePercent}
                      invertColor={metric.invertColor}
                      sparkline={metric.sparkline}
                      href={metric.href}
                    />
                  ))}
              </div>
            </section>

            {/* Quick Navigation Cards */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Explore
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <NavCard
                  href="/debt"
                  title="National Debt"
                  description="Total debt outstanding, composition, growth trajectory, and auction results"
                  icon={<Landmark className="h-5 w-5" />}
                />
                <NavCard
                  href="/liquidity"
                  title="Liquidity & Fed"
                  description="Fed balance sheet, TGA, reverse repo, net liquidity formula"
                  icon={<Droplets className="h-5 w-5" />}
                />
                <NavCard
                  href="/fiscal"
                  title="Fiscal Flows"
                  description="Federal receipts, outlays, budget deficit, spending by category"
                  icon={<Receipt className="h-5 w-5" />}
                />
                <NavCard
                  href="/markets"
                  title="Dollar & Markets"
                  description="DXY, Treasury yields, yield curve, market indicators"
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>
            </section>
          </div>
        )}
      </Shell>
    </>
  );
}

function NavCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="panel group flex items-start gap-3 p-4 transition-colors hover:border-primary/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
