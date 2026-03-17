"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { KPIRow } from "@/components/shared/KPIRow";
import { MetricCard } from "@/components/charts/MetricCard";
import { TickerStrip } from "@/components/charts/TickerStrip";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ApiWarning, NoDataState } from "@/components/shared/ApiWarning";
import { SourceFooter } from "@/components/shared/SourceFooter";
import {
  RefreshCw,
  Landmark,
  Droplets,
  TrendingUp,
  Receipt,
  ArrowRight,
  Activity,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/useUIStore";
import type { TickerItem } from "@/components/charts/TickerStrip";

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCompact(v: number | null | undefined): string {
  if (v == null) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

function fmtBps(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(0)} bps`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { sidebarOpen } = useUIStore();

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["overview"],
    queryFn: () => fetch("/api/v1/overview").then((r) => r.json()),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  const d = data?.data;
  const warnings = data?.warnings ?? [];
  const lastRefresh = dataUpdatedAt
    ? new Date(dataUpdatedAt).toISOString()
    : new Date().toISOString();

  // Build ticker items from live data
  const tickerItems: TickerItem[] = d
    ? [
        { label: "NAT'L DEBT", value: fmtCompact(d.debt?.totalDebt), change: d.debt?.changePercent },
        { label: "10Y", value: fmtPct(d.rates?.treasury10Y?.current), change: null },
        { label: "2Y", value: fmtPct(d.rates?.treasury2Y?.current), change: null },
        { label: "FED FUNDS", value: fmtPct(d.rates?.fedFunds?.current), change: null },
        { label: "CPI YoY", value: d.inflation?.yoyChange ? `${d.inflation.yoyChange.toFixed(1)}%` : "—", change: null },
        { label: "M2", value: d.money?.m2?.latest ? fmtCompact(d.money.m2.latest * 1e9) : "—", change: null },
        { label: "FED BS", value: d.money?.fedTotalAssets?.latest ? fmtCompact(d.money.fedTotalAssets.latest * 1e6) : "—", change: null },
        { label: "DXY", value: d.dollarStrength?.current?.toFixed(1) ?? "—", change: d.dollarStrength?.changePercent },
      ]
    : [];

  // Build KPI row
  const kpiItems = d
    ? [
        { label: "National Debt", value: fmtCompact(d.debt?.totalDebt), change: d.debt?.dailyChange, changePercent: d.debt?.changePercent, invertColor: true },
        { label: "Debt Held by Public", value: fmtCompact(d.debt?.debtHeldByPublic), change: null, changePercent: null },
        { label: "Fed Funds Rate", value: fmtPct(d.rates?.fedFunds?.current), change: null, changePercent: null },
        { label: "10Y Treasury", value: fmtPct(d.rates?.treasury10Y?.current), change: null, changePercent: null },
        { label: "Yield Spread", value: d.rates?.yieldCurveSpread != null ? fmtBps(d.rates.yieldCurveSpread) : "—", change: null, changePercent: null },
        { label: "CPI YoY", value: d.inflation?.yoyChange ? `${d.inflation.yoyChange.toFixed(1)}%` : "—", change: null, changePercent: null },
        { label: "Dollar Index", value: d.dollarStrength?.current?.toFixed(1) ?? "—", change: d.dollarStrength?.change, changePercent: d.dollarStrength?.changePercent },
      ]
    : [];

  return (
    <>
      <TopBar title="Dashboard" subtitle="U.S. Dollar System Overview">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          Refresh
        </button>
        <span className="hidden text-2xs text-muted-foreground sm:block">
          {new Date().toLocaleTimeString()}
        </span>
      </TopBar>

      {/* Ticker Strip */}
      {tickerItems.length > 0 && (
        <div
          className={cn(
            "transition-all duration-300",
            sidebarOpen ? "md:ml-sidebar" : "md:ml-sidebar-sm"
          )}
        >
          <TickerStrip items={tickerItems} />
        </div>
      )}

      <Shell>
        <div className="space-y-6">
          {isLoading && <LoadingState />}
          {error && <ErrorState />}
          <ApiWarning warnings={warnings} />

          {!d && !isLoading && !error && (
            <NoDataState message="Overview data unavailable — government APIs may be unreachable" />
          )}

          {d && (
            <>
              {/* ─── Top KPI Row ─────────────────────────────── */}
              <section>
                <KPIRow items={kpiItems} />
              </section>

              {/* ─── National Debt Chart ──────────────────────── */}
              {d.debt?.series?.length > 0 && (
                <section>
                  <SectionHeader icon={<Landmark />} label="National Debt" />
                  <TimeSeriesChart
                    data={d.debt.series}
                    label="Total Public Debt Outstanding"
                    color="#ea3943"
                    height={350}
                    formatValue={(v) => fmtCompact(v)}
                  />
                </section>
              )}

              {/* ─── Rates Section ────────────────────────────── */}
              <section>
                <SectionHeader icon={<TrendingUp />} label="Interest Rates" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="Fed Funds Rate"
                    value={fmtPct(d.rates?.fedFunds?.current)}
                    href="/rates"
                    sparkline={d.rates?.fedFunds?.series}
                  />
                  <MetricCard
                    label="10Y Treasury"
                    value={fmtPct(d.rates?.treasury10Y?.current)}
                    href="/rates"
                    sparkline={d.rates?.treasury10Y?.series}
                  />
                  <MetricCard
                    label="2Y Treasury"
                    value={fmtPct(d.rates?.treasury2Y?.current)}
                    href="/rates"
                    sparkline={d.rates?.treasury2Y?.series}
                  />
                </div>
              </section>

              {/* ─── Money & Inflation ───────────────────────── */}
              <section>
                <SectionHeader icon={<Droplets />} label="Money & Inflation" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="CPI YoY"
                    value={d.inflation?.yoyChange ? `${d.inflation.yoyChange.toFixed(1)}%` : "—"}
                    subtitle="Inflation rate"
                    href="/inflation"
                  />
                  <MetricCard
                    label="M2 Money Supply"
                    value={d.money?.m2?.latest ? fmtCompact(d.money.m2.latest * 1e9) : "—"}
                    href="/money-supply"
                    sparkline={d.money?.m2?.series?.map((p: { date: string; value: number }) => ({ ...p, value: p.value * 1e9 }))}
                  />
                  <MetricCard
                    label="Fed Total Assets"
                    value={d.money?.fedTotalAssets?.latest ? fmtCompact(d.money.fedTotalAssets.latest * 1e6) : "—"}
                    href="/money-supply"
                    sparkline={d.money?.fedTotalAssets?.series?.map((p: { date: string; value: number }) => ({ ...p, value: p.value * 1e6 }))}
                  />
                </div>
              </section>

              {/* ─── CPI Chart ────────────────────────────────── */}
              {d.inflation?.cpiAll?.length > 0 && (
                <section>
                  <SectionHeader icon={<Receipt />} label="CPI All Items" />
                  <TimeSeriesChart
                    data={d.inflation.cpiAll}
                    label="CPI — All Items (Seasonally Adjusted)"
                    color="#10b981"
                    height={300}
                    formatValue={(v) => v.toFixed(1)}
                  />
                </section>
              )}

              {/* ─── Dollar Strength Chart ────────────────────── */}
              {d.dollarStrength?.series?.length > 0 && (
                <section>
                  <SectionHeader icon={<BarChart3 />} label="Dollar Strength Index" />
                  <TimeSeriesChart
                    data={d.dollarStrength.series}
                    label="Trade-Weighted Broad Dollar Index (DTWEXBGS)"
                    color="#3b82f6"
                    height={300}
                    formatValue={(v) => v.toFixed(1)}
                  />
                </section>
              )}

              {/* ─── Explore Navigation ──────────────────────── */}
              <section>
                <SectionHeader icon={<Activity />} label="Explore" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <NavCard href="/debt" title="National Debt" description="Total debt, composition, daily changes" icon={<Landmark className="h-5 w-5" />} color="text-negative" bgColor="bg-negative/10" />
                  <NavCard href="/rates" title="Interest Rates" description="Fed funds, Treasury yields, yield curve" icon={<TrendingUp className="h-5 w-5" />} color="text-info" bgColor="bg-info/10" />
                  <NavCard href="/inflation" title="Inflation" description="CPI, Core CPI, breakeven rates" icon={<Receipt className="h-5 w-5" />} color="text-purple-400" bgColor="bg-purple-400/10" />
                  <NavCard href="/money-supply" title="Money Supply" description="M2, Fed balance sheet, reserves" icon={<Droplets className="h-5 w-5" />} color="text-positive" bgColor="bg-positive/10" />
                  <NavCard href="/dollar-strength" title="Dollar Strength" description="Trade-weighted dollar index" icon={<TrendingUp className="h-5 w-5" />} color="text-gold-400" bgColor="bg-gold-400/10" />
                  <NavCard href="/defense" title="Defense Spending" description="DoD obligations from USAspending" icon={<Landmark className="h-5 w-5" />} color="text-negative" bgColor="bg-negative/10" />
                  <NavCard href="/foreign-assistance" title="Foreign Assistance" description="U.S. foreign aid from USAID" icon={<TrendingUp className="h-5 w-5" />} color="text-info" bgColor="bg-info/10" />
                  <NavCard href="/source-health" title="Source Health" description="Live status of all data feeds" icon={<Activity className="h-5 w-5" />} color="text-positive" bgColor="bg-positive/10" />
                </div>
              </section>

              {/* ─── Source Footer ────────────────────────────── */}
              <SourceFooter
                sources={["U.S. Treasury FiscalData API", "Federal Reserve FRED", "Bureau of Labor Statistics", "USAspending.gov", "USAID Open Data"]}
                lastFetched={lastRefresh}
                methodology="All data sourced from official U.S. government APIs. No third-party intermediaries."
              />
            </>
          )}
        </div>
      </Shell>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="panel h-20 animate-pulse bg-surface-1" />
        ))}
      </div>
      <div className="panel h-80 animate-pulse bg-surface-1" />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="panel border-negative/30 p-4">
      <p className="text-sm text-negative">Failed to load dashboard data. Please try refreshing.</p>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <h2 className="label-lg text-muted-foreground">{label}</h2>
    </div>
  );
}

function NavCard({
  href,
  title,
  description,
  icon,
  color,
  bgColor,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <Link
      href={href}
      className="group panel flex items-start gap-3 p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          bgColor,
          color
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-2xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Explore <ArrowRight className="h-2.5 w-2.5" />
        </span>
      </div>
    </Link>
  );
}
