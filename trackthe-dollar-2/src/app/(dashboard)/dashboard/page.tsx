"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { KPIRow } from "@/components/shared/KPIRow";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { YieldCurveChart } from "@/components/charts/YieldCurveChart";
import { MiniDonutChart } from "@/components/charts/MiniDonutChart";
import { MetricCard } from "@/components/charts/MetricCard";
import { TickerStrip } from "@/components/charts/TickerStrip";
import { WhatChangedToday } from "@/components/shared/WhatChangedToday";
import { AIBriefingCard } from "@/components/shared/AIBriefingCard";
import { EventFeed } from "@/components/shared/EventFeed";
import { SourceFooter } from "@/components/shared/SourceFooter";
import { SourceConfidencePanel } from "@/components/shared/SourceConfidencePanel";
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
import type { TimeSeriesPoint } from "@/types/dollar";
import {
  MOCK_EVENTS,
  MOCK_SPENDING_CATEGORIES,
  MOCK_REVENUE_SOURCES,
  MOCK_SOURCE_CONFIDENCE,
  TIMEFRAME_OPTIONS,
} from "@/lib/mock/data";

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmtT(v: number | null | undefined): string {
  if (v == null) return "—";
  return `$${(v / 1e12).toFixed(2)}T`;
}
function fmtB(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  return `$${(v / 1e9).toFixed(1)}B`;
}
function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverviewData {
  debt: {
    totalDebt: number | null;
    dailyChange: number | null;
    changePercent: number | null;
    lastDate: string | null;
    series: TimeSeriesPoint[];
  };
  rates: {
    fedFunds: { current: number | null; series: TimeSeriesPoint[] } | null;
    treasury10Y: { current: number | null; series: TimeSeriesPoint[] } | null;
    treasury2Y: { current: number | null; series: TimeSeriesPoint[] } | null;
  };
  money: {
    m2: { latest: number | null; series: TimeSeriesPoint[] } | null;
    fedTotalAssets: { latest: number | null; series: TimeSeriesPoint[] } | null;
  };
  dollarStrength: {
    current: number | null;
    change: number | null;
    changePercent: number | null;
    series: TimeSeriesPoint[];
  };
  inflation: {
    yoyChange: number | null;
    latestCpi: number | null;
    cpiAll: TimeSeriesPoint[];
  };
}

interface AINarrative {
  title: string;
  summary: string;
  sources: string[];
  generatedAt: string;
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { sidebarOpen } = useUIStore();
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toISOString());

  const { data: overviewData, isLoading: overviewLoading, refetch } = useQuery<OverviewData>({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await fetch("/api/v1/overview");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.data as OverviewData;
    },
    refetchInterval: 300_000,
    staleTime: 60_000,
  });

  const { data: narrative } = useQuery<AINarrative | null>({
    queryKey: ["dashboard-narrative"],
    queryFn: async () => {
      const res = await fetch("/api/v1/ai/narrative");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as AINarrative | null;
    },
    staleTime: 3_600_000, // 1 hour — cached by server too
    retry: false,
  });

  const ov = overviewData;

  // ─── Ticker items from live data ──────────────────────────────────────────
  const tickerItems: TickerItem[] = [
    { label: "NAT'L DEBT", value: fmtT(ov?.debt.totalDebt), change: ov?.debt.changePercent ?? 0 },
    { label: "FED BS", value: fmtT(ov?.money?.fedTotalAssets?.latest), change: 0 },
    { label: "10Y", value: fmtPct(ov?.rates?.treasury10Y?.current), change: 0 },
    { label: "2Y", value: fmtPct(ov?.rates?.treasury2Y?.current), change: 0 },
    { label: "FED FUNDS", value: fmtPct(ov?.rates?.fedFunds?.current), change: 0 },
    { label: "CPI YOY", value: fmtPct(ov?.inflation?.yoyChange), change: 0 },
    { label: "M2", value: fmtT(ov?.money?.m2?.latest), change: 0 },
    { label: "DOLLAR", value: ov?.dollarStrength?.current?.toFixed(2) ?? "—", change: ov?.dollarStrength?.changePercent ?? 0 },
  ];

  // ─── KPI row items from live data ─────────────────────────────────────────
  const kpiItems = [
    { label: "National Debt", value: fmtT(ov?.debt.totalDebt), change: ov?.debt.dailyChange ?? 0, changePercent: ov?.debt.changePercent ?? 0, invertColor: true },
    { label: "Daily Debt Chg", value: fmtB(ov?.debt.dailyChange), change: ov?.debt.dailyChange ?? 0, invertColor: true },
    { label: "Fed Funds", value: fmtPct(ov?.rates?.fedFunds?.current), change: 0 },
    { label: "10Y Yield", value: fmtPct(ov?.rates?.treasury10Y?.current), change: 0 },
    { label: "CPI YoY", value: fmtPct(ov?.inflation?.yoyChange), change: 0 },
    { label: "M2 Supply", value: fmtT(ov?.money?.m2?.latest), change: 0 },
    { label: "Dollar Index", value: ov?.dollarStrength?.current?.toFixed(2) ?? "—", change: ov?.dollarStrength?.change ?? 0, changePercent: ov?.dollarStrength?.changePercent ?? 0 },
  ];

  // ─── What Changed Today from live debt data ────────────────────────────────
  const dailyChanges = ov?.debt.dailyChange != null ? [
    {
      id: "debt",
      metric: "National Debt",
      direction: (ov.debt.dailyChange > 0 ? "up" : "down") as "up" | "down",
      magnitude: `+${fmtB(ov.debt.dailyChange)}`,
      context: `Total debt ${fmtT(ov.debt.totalDebt)} as of ${ov.debt.lastDate ?? "today"}`,
      invertSentiment: true,
    },
    ...(ov?.inflation?.yoyChange != null ? [{
      id: "cpi",
      metric: "CPI Inflation",
      direction: "neutral" as const,
      magnitude: `${fmtPct(ov.inflation.yoyChange)} YoY`,
      context: `Latest CPI reading: ${ov.inflation.latestCpi?.toFixed(2) ?? "—"}`,
    }] : []),
  ] : [];

  // ─── Debt series for interactive chart ────────────────────────────────────
  const debtSeries: TimeSeriesPoint[] = ov?.debt.series ?? [];

  const chartSeriesOptions = [
    { id: "debt", label: "National Debt", color: "#ea3943" },
  ];

  const handleGetChartData = useCallback(
    (_seriesId: string) => debtSeries,
    [debtSeries]
  );

  // ─── Yield curve from live rates (3 points) ───────────────────────────────
  const yieldCurveData = [
    { label: "2Y", value: ov?.rates?.treasury2Y?.current ?? null },
    { label: "10Y", value: ov?.rates?.treasury10Y?.current ?? null },
  ].filter((p) => p.value != null).map((p) => ({ label: p.label, value: p.value as number }));

  const handleRefresh = () => {
    setLastRefresh(new Date().toISOString());
    refetch();
  };

  // ─── Net liquidity formula values ─────────────────────────────────────────
  const fedBS = ov?.money?.fedTotalAssets?.latest;

  return (
    <>
      <TopBar title="Dashboard" subtitle="U.S. Dollar System Overview">
        <button
          onClick={handleRefresh}
          disabled={overviewLoading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", overviewLoading && "animate-spin")} />
          Refresh
        </button>
        <span className="hidden text-2xs text-muted-foreground sm:block">
          {new Date().toLocaleTimeString()}
        </span>
      </TopBar>

      {/* Ticker Strip */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-sidebar" : "ml-sidebar-sm"
        )}
      >
        <TickerStrip items={tickerItems} />
      </div>

      <Shell>
        <div className="space-y-6">
          {/* ─── Top KPI Row ─────────────────────────────── */}
          <section>
            <KPIRow items={kpiItems} />
          </section>

          {/* ─── What Changed Today ──────────────────────── */}
          {dailyChanges.length > 0 && (
            <WhatChangedToday changes={dailyChanges} />
          )}

          {/* ─── Main Chart Area ─────────────────────────── */}
          <section>
            <SectionHeader icon={<BarChart3 />} label="National Debt — Live Treasury Data" />
            {debtSeries.length > 0 ? (
              <InteractiveChart
                seriesOptions={chartSeriesOptions}
                getSeriesData={handleGetChartData}
                timeframes={[...TIMEFRAME_OPTIONS]}
                defaultSeries="debt"
                height={380}
              />
            ) : (
              <div className="panel flex h-40 items-center justify-center text-sm text-muted-foreground">
                Loading debt series…
              </div>
            )}
          </section>

          {/* ─── Two-column: Yield Curve + Spending Breakdown ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {yieldCurveData.length >= 2 ? (
              <YieldCurveChart
                data={yieldCurveData}
                title="Treasury Yield Curve (Live)"
                height={260}
              />
            ) : (
              <div className="panel flex h-40 items-center justify-center text-sm text-muted-foreground">
                Yield curve requires FRED API key
              </div>
            )}
            <MiniDonutChart
              data={MOCK_SPENDING_CATEGORIES}
              title="Federal Spending Breakdown (FY2025 Est.)"
              centerLabel="Total"
              centerValue="$6.75T"
              height={220}
            />
          </div>

          {/* ─── Dollar System Vitals ────────────────────────── */}
          <section>
            <SectionHeader icon={<TrendingUp />} label="Dollar System Vitals" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard
                label="National Debt"
                value={fmtT(ov?.debt.totalDebt)}
                change={ov?.debt.dailyChange}
                changePercent={ov?.debt.changePercent}
                invertColor
                subtitle={ov?.debt.lastDate ?? undefined}
                href="/debt"
              />
              <MetricCard
                label="Fed Balance Sheet"
                value={fmtT(ov?.money?.fedTotalAssets?.latest)}
                change={0}
                href="/money-supply"
              />
              <MetricCard
                label="M2 Money Supply"
                value={fmtT(ov?.money?.m2?.latest)}
                change={0}
                href="/money-supply"
              />
              <MetricCard
                label="Dollar Index"
                value={ov?.dollarStrength?.current?.toFixed(2) ?? "—"}
                change={ov?.dollarStrength?.change}
                changePercent={ov?.dollarStrength?.changePercent}
                href="/dollar-strength"
              />
              <MetricCard
                label="CPI Inflation"
                value={fmtPct(ov?.inflation?.yoyChange)}
                change={0}
                invertColor
                href="/inflation"
              />
            </div>
          </section>

          {/* ─── Rates & Yields ──────────────────────────── */}
          <section>
            <SectionHeader icon={<Landmark />} label="Rates & Yields" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Fed Funds" value={fmtPct(ov?.rates?.fedFunds?.current)} href="/rates" />
              <MetricCard label="10Y Treasury" value={fmtPct(ov?.rates?.treasury10Y?.current)} href="/rates" />
              <MetricCard label="2Y Treasury" value={fmtPct(ov?.rates?.treasury2Y?.current)} href="/rates" />
              <MetricCard
                label="Yield Curve Spread"
                value={
                  ov?.rates?.treasury10Y?.current != null && ov?.rates?.treasury2Y?.current != null
                    ? fmtPct(ov.rates.treasury10Y.current - ov.rates.treasury2Y.current)
                    : "—"
                }
                href="/rates"
              />
            </div>
          </section>

          {/* ─── Money & Inflation ───────────────────────── */}
          <section>
            <SectionHeader icon={<Droplets />} label="Money & Inflation" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="M2 Supply" value={fmtT(ov?.money?.m2?.latest)} href="/money-supply" />
              <MetricCard label="Fed Balance Sheet" value={fmtT(ov?.money?.fedTotalAssets?.latest)} href="/money-supply" />
              <MetricCard label="CPI YoY" value={fmtPct(ov?.inflation?.yoyChange)} invertColor href="/inflation" />
              <MetricCard label="Latest CPI" value={ov?.inflation?.latestCpi?.toFixed(2) ?? "—"} href="/inflation" />
            </div>
          </section>

          {/* ─── Revenue breakdown + Net Liquidity formula ─ */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MiniDonutChart
              data={MOCK_REVENUE_SOURCES}
              title="Federal Revenue Sources (FY2025 Est.)"
              centerLabel="Total"
              centerValue="$4.90T"
              height={200}
            />
            {/* Net Liquidity Formula Card */}
            <div className="panel p-5">
              <h3 className="mb-4 text-sm font-medium text-foreground">Net Liquidity Formula</h3>
              <div className="rounded-lg bg-surface-2 p-4">
                <p className="font-data text-center text-sm text-foreground">
                  <span className="text-info">Fed BS</span>
                  {" − "}
                  <span className="text-gold-400">TGA</span>
                  {" − "}
                  <span className="text-purple-400">RRP</span>
                  {" = "}
                  <span className="font-bold text-primary">Net Liquidity</span>
                </p>
                <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-2xs text-info">Fed BS</p>
                    <p className="font-data text-sm font-semibold text-foreground">{fmtT(fedBS)}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-gold-400">TGA</p>
                    <p className="font-data text-sm font-semibold text-foreground">Live →</p>
                  </div>
                  <div>
                    <p className="text-2xs text-purple-400">RRP</p>
                    <p className="font-data text-sm font-semibold text-foreground">Live →</p>
                  </div>
                  <div>
                    <p className="text-2xs text-primary">Net Liq</p>
                    <p className="font-data text-sm font-bold text-primary">/liquidity</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-2xs leading-relaxed text-muted-foreground">
                Net liquidity measures the effective amount of money available in the financial system.
                When the Fed shrinks its balance sheet (QT) or the Treasury builds its cash pile (TGA),
                liquidity decreases. When the RRP facility drains, that cash re-enters the system.
              </p>
            </div>
          </div>

          {/* ─── Three-column: AI Briefing + Events + Sources ─ */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <AIBriefingCard
                title={narrative?.title ?? "Daily Fiscal Briefing"}
                summary={
                  narrative?.summary ??
                  (process.env.NEXT_PUBLIC_APP_URL
                    ? "Generating briefing with Perplexity AI…"
                    : "Configure PERPLEXITY_API_KEY to enable AI briefings sourced from live news.")
                }
                sources={narrative?.sources ?? ["treasury.gov", "federalreserve.gov", "bls.gov"]}
                generatedAt={narrative?.generatedAt ?? new Date().toISOString()}
              />
            </div>
            <div className="lg:col-span-3">
              <EventFeed events={MOCK_EVENTS} />
            </div>
            <div className="lg:col-span-4">
              <SourceConfidencePanel sources={MOCK_SOURCE_CONFIDENCE} />
            </div>
          </div>

          {/* ─── Explore Navigation ──────────────────────── */}
          <section>
            <SectionHeader icon={<Activity />} label="Explore" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <NavCard href="/dollar-strength" title="Dollar Strength" description="Trade-weighted dollar index from FRED" icon={<TrendingUp className="h-5 w-5" />} color="text-gold-400" bgColor="bg-gold-400/10" />
              <NavCard href="/debt" title="National Debt" description="Total debt, composition, daily changes" icon={<Landmark className="h-5 w-5" />} color="text-negative" bgColor="bg-negative/10" />
              <NavCard href="/rates" title="Interest Rates" description="Fed funds, Treasury yields, yield curve" icon={<TrendingUp className="h-5 w-5" />} color="text-info" bgColor="bg-info/10" />
              <NavCard href="/money-supply" title="Money Supply" description="M2, Fed balance sheet, reserves" icon={<Droplets className="h-5 w-5" />} color="text-positive" bgColor="bg-positive/10" />
              <NavCard href="/inflation" title="Inflation" description="CPI, Core CPI, breakeven rates" icon={<Receipt className="h-5 w-5" />} color="text-purple-400" bgColor="bg-purple-400/10" />
              <NavCard href="/defense" title="Defense Spending" description="DoD obligations and outlays from USAspending" icon={<Landmark className="h-5 w-5" />} color="text-negative" bgColor="bg-negative/10" />
              <NavCard href="/foreign-assistance" title="Foreign Assistance" description="U.S. foreign aid flows from USAID" icon={<TrendingUp className="h-5 w-5" />} color="text-info" bgColor="bg-info/10" />
              <NavCard href="/source-health" title="Source Health" description="Live status of all government data feeds" icon={<Activity className="h-5 w-5" />} color="text-positive" bgColor="bg-positive/10" />
            </div>
          </section>

          {/* ─── Source Footer ────────────────────────────── */}
          <SourceFooter
            sources={["U.S. Treasury FiscalData API", "Federal Reserve FRED", "Bureau of Labor Statistics", "USAspending.gov", "USAID Open Data"]}
            lastFetched={lastRefresh}
            methodology="All numerical data sourced exclusively from official U.S. government APIs. AI briefing powered by Perplexity with web search citations."
          />
        </div>
      </Shell>
    </>
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

function NavCard({ href, title, description, icon, color, bgColor }: { href: string; title: string; description: string; icon: React.ReactNode; color: string; bgColor: string }) {
  return (
    <Link href={href} className="group panel flex items-start gap-3 p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors", bgColor, color)}>
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
