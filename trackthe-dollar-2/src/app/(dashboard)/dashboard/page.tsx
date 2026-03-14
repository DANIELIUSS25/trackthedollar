"use client";

import { useState, useCallback } from "react";
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

import {
  MOCK_KPI_METRICS,
  MOCK_DAILY_CHANGES,
  MOCK_EVENTS,
  MOCK_AI_BRIEFING,
  MOCK_YIELD_CURVE_CURRENT,
  MOCK_SPENDING_CATEGORIES,
  MOCK_REVENUE_SOURCES,
  MOCK_SOURCE_CONFIDENCE,
  MOCK_TICKER_ITEMS,
  TIMEFRAME_OPTIONS,
  CHART_SERIES_OPTIONS,
  getChartData,
} from "@/lib/mock/data";

export default function DashboardPage() {
  const { sidebarOpen } = useUIStore();
  const [lastRefresh] = useState(() => new Date().toISOString());

  // Build ticker items
  const tickerItems: TickerItem[] = MOCK_TICKER_ITEMS.map((m) => ({
    label: m.label,
    value: m.value,
    change: m.change,
  }));

  // Stable callback for chart data
  const handleGetChartData = useCallback((seriesId: string) => getChartData(seriesId), []);

  // KPI row items — top 7
  const kpiItems = MOCK_KPI_METRICS.slice(0, 7).map((m) => ({
    label: m.label,
    value: m.formattedValue,
    change: m.change,
    changePercent: m.changePercent,
    invertColor: m.invertColor,
    sparkline: m.sparkline,
  }));

  return (
    <>
      <TopBar title="Dashboard" subtitle="U.S. Dollar System Overview">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
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
          <WhatChangedToday changes={MOCK_DAILY_CHANGES} />

          {/* ─── Main Chart Area ─────────────────────────── */}
          <section>
            <SectionHeader icon={<BarChart3 />} label="System Chart" />
            <InteractiveChart
              seriesOptions={[...CHART_SERIES_OPTIONS]}
              getSeriesData={handleGetChartData}
              timeframes={[...TIMEFRAME_OPTIONS]}
              defaultSeries="net_liquidity"
              height={380}
            />
          </section>

          {/* ─── Two-column: Yield Curve + Spending Breakdown ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <YieldCurveChart
              data={MOCK_YIELD_CURVE_CURRENT}
              title="Treasury Yield Curve"
              height={260}
            />
            <MiniDonutChart
              data={MOCK_SPENDING_CATEGORIES}
              title="Federal Spending Breakdown"
              centerLabel="Total"
              centerValue="$6.25T"
              height={220}
            />
          </div>

          {/* ─── Dollar System Vitals ────────────────────── */}
          <section>
            <SectionHeader icon={<TrendingUp />} label="Dollar System Vitals" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {MOCK_KPI_METRICS.filter((m) =>
                ["total_debt", "fed_balance_sheet", "tga", "rrp", "net_liquidity"].includes(m.id)
              ).map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.formattedValue}
                  change={metric.change}
                  changePercent={metric.changePercent}
                  invertColor={metric.invertColor ?? false}
                  sparkline={metric.sparkline}
                  href={metric.href}
                  subtitle={new Date(metric.lastUpdated).toLocaleDateString()}
                />
              ))}
            </div>
          </section>

          {/* ─── Rates & Yields ──────────────────────────── */}
          <section>
            <SectionHeader icon={<Landmark />} label="Rates & Yields" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_KPI_METRICS.filter((m) =>
                ["fed_funds", "dgs10", "yield_curve"].includes(m.id)
              ).map((metric) => (
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

          {/* ─── Money & Inflation ───────────────────────── */}
          <section>
            <SectionHeader icon={<Droplets />} label="Money & Inflation" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_KPI_METRICS.filter((m) => ["m2", "cpi"].includes(m.id)).map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.formattedValue}
                  change={metric.change}
                  changePercent={metric.changePercent}
                  invertColor={metric.invertColor ?? false}
                  sparkline={metric.sparkline}
                  href={metric.href}
                />
              ))}
            </div>
          </section>

          {/* ─── Fiscal Metrics ──────────────────────────── */}
          <section>
            <SectionHeader icon={<Receipt />} label="Fiscal" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_KPI_METRICS.filter((m) =>
                ["deficit_ytd", "interest_expense"].includes(m.id)
              ).map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.formattedValue}
                  change={metric.change}
                  changePercent={metric.changePercent}
                  invertColor={metric.invertColor ?? false}
                  sparkline={metric.sparkline}
                  href={metric.href}
                />
              ))}
            </div>
          </section>

          {/* ─── Revenue breakdown ───────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MiniDonutChart
              data={MOCK_REVENUE_SOURCES}
              title="Federal Revenue Sources"
              centerLabel="Total"
              centerValue="$4.90T"
              height={200}
            />
            {/* Liquidity Formula Card */}
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
                    <p className="font-data text-sm font-semibold text-foreground">$6.82T</p>
                  </div>
                  <div>
                    <p className="text-2xs text-gold-400">TGA</p>
                    <p className="font-data text-sm font-semibold text-foreground">$782B</p>
                  </div>
                  <div>
                    <p className="text-2xs text-purple-400">RRP</p>
                    <p className="font-data text-sm font-semibold text-foreground">$147B</p>
                  </div>
                  <div>
                    <p className="text-2xs text-primary">Net Liq</p>
                    <p className="font-data text-sm font-bold text-primary">$5.89T</p>
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
                title={MOCK_AI_BRIEFING.title}
                summary={MOCK_AI_BRIEFING.summary}
                sources={MOCK_AI_BRIEFING.sources}
                generatedAt={MOCK_AI_BRIEFING.generatedAt}
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
              <NavCard
                href="/debt"
                title="National Debt"
                description="Total debt, composition, growth, auction results"
                icon={<Landmark className="h-5 w-5" />}
                color="text-gold-400"
                bgColor="bg-gold-400/10"
              />
              <NavCard
                href="/liquidity"
                title="Liquidity & Fed"
                description="Fed BS, TGA, RRP, net liquidity formula"
                icon={<Droplets className="h-5 w-5" />}
                color="text-info"
                bgColor="bg-info/10"
              />
              <NavCard
                href="/fiscal"
                title="Fiscal Flows"
                description="Receipts, outlays, deficit, spending breakdown"
                icon={<Receipt className="h-5 w-5" />}
                color="text-positive"
                bgColor="bg-positive/10"
              />
              <NavCard
                href="/markets"
                title="Dollar & Markets"
                description="Yields, curve, money supply, inflation"
                icon={<TrendingUp className="h-5 w-5" />}
                color="text-purple-400"
                bgColor="bg-purple-400/10"
              />
            </div>
          </section>

          {/* ─── Source Footer ────────────────────────────── */}
          <SourceFooter
            sources={["U.S. Treasury FiscalData API", "Federal Reserve FRED", "Calculated composites"]}
            lastFetched={lastRefresh}
            methodology="All data sourced from official U.S. government APIs. Net Liquidity = Fed Balance Sheet − TGA − RRP."
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
