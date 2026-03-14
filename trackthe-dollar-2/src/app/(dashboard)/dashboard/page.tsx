"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { TickerStrip } from "@/components/charts/TickerStrip";
import { WhatChangedToday } from "@/components/shared/WhatChangedToday";
import { AIBriefingCard } from "@/components/shared/AIBriefingCard";
import { EventFeed } from "@/components/shared/EventFeed";
import { SourceFooter } from "@/components/shared/SourceFooter";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw, Landmark, Droplets, TrendingUp, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/useUIStore";
import type { TickerItem } from "@/components/charts/TickerStrip";
import type { DailyChange } from "@/components/shared/WhatChangedToday";
import type { FeedEvent } from "@/components/shared/EventFeed";

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
  const { sidebarOpen } = useUIStore();
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

  // Build ticker items from metrics
  const tickerItems: TickerItem[] = data
    ? data.metrics.map((m) => ({
        label: m.id.replace(/_/g, " ").toUpperCase(),
        value: m.formattedValue,
        change: m.changePercent,
      }))
    : [];

  // Build "What Changed Today" from metrics with changes
  const dailyChanges: DailyChange[] = data
    ? data.metrics
        .filter((m) => m.change !== null && m.change !== 0)
        .slice(0, 5)
        .map((m) => ({
          id: m.id,
          metric: m.label,
          direction: (m.change ?? 0) > 0 ? "up" as const : "down" as const,
          magnitude: m.formattedValue,
          context: `Source: ${m.source}${m.lastUpdated ? ` · ${new Date(m.lastUpdated).toLocaleDateString()}` : ""}`,
          invertSentiment: m.invertColor,
        }))
    : [];

  // Static event feed (would be API-driven in production)
  const events: FeedEvent[] = [
    {
      id: "1",
      date: new Date().toISOString(),
      title: "Dashboard loaded with live data",
      detail: "All metrics fetched from Treasury, FRED, and FiscalData APIs",
      type: "data_release",
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString(),
      title: "Federal Reserve H.4.1 release (weekly)",
      detail: "Fed balance sheet data updated",
      type: "policy",
    },
    {
      id: "3",
      date: new Date(Date.now() - 172800000).toISOString(),
      title: "Daily Treasury Statement published",
      detail: "TGA balance and cash position updated",
      type: "fiscal",
    },
  ];

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="U.S. Dollar System Overview"
      >
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
        {dataUpdatedAt > 0 && (
          <span className="hidden text-2xs text-muted-foreground sm:block">
            {new Date(dataUpdatedAt).toLocaleTimeString()}
          </span>
        )}
      </TopBar>

      {/* ─── Ticker Strip ──────────────────────────────────── */}
      {tickerItems.length > 0 && (
        <div
          className={cn(
            "transition-all duration-layout",
            sidebarOpen ? "ml-sidebar" : "ml-sidebar-sm"
          )}
        >
          <TickerStrip items={tickerItems} />
        </div>
      )}

      <Shell>
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* ─── What Changed Today ────────────────────── */}
            {dailyChanges.length > 0 && (
              <WhatChangedToday changes={dailyChanges} />
            )}

            {/* ─── Dollar System Vitals ──────────────────── */}
            <section>
              <SectionHeader icon={<TrendingUp />} label="Dollar System Vitals" />
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
                      subtitle={metric.lastUpdated ? new Date(metric.lastUpdated).toLocaleDateString() : undefined}
                    />
                  ))}
              </div>
            </section>

            {/* ─── Rates & Yields ────────────────────────── */}
            <section>
              <SectionHeader icon={<Landmark />} label="Rates & Yields" />
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

            {/* ─── Money & Inflation ─────────────────────── */}
            <section>
              <SectionHeader icon={<Droplets />} label="Money & Inflation" />
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

            {/* ─── Two-column: AI Briefing + Event Feed ──── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <AIBriefingCard
                  title="Daily Intelligence Summary"
                  summary={`The U.S. national debt stands at ${data.metrics.find((m) => m.id === "total_debt")?.formattedValue ?? "$36T+"}, with the Treasury continuing to fund operations through regular auctions. The Federal Reserve's balance sheet reflects ongoing quantitative tightening, while the reverse repo facility continues its structural decline as money market funds deploy cash into Treasury bills.\n\nNet liquidity — calculated as Fed Balance Sheet minus TGA minus RRP — remains a key driver of financial conditions. Monitor the TGA balance closely around upcoming auction settlements and tax receipt dates.`}
                  sources={["Treasury.gov", "FRED", "FiscalData API"]}
                  generatedAt={new Date().toISOString()}
                />
              </div>
              <div className="lg:col-span-2">
                <EventFeed events={events} />
              </div>
            </div>

            {/* ─── Explore Navigation ────────────────────── */}
            <section>
              <SectionHeader icon={<Receipt />} label="Explore" />
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

            {/* ─── Source Footer ──────────────────────────── */}
            <SourceFooter
              sources={["U.S. Treasury FiscalData API", "Federal Reserve FRED", "Calculated composites"]}
              lastFetched={data.lastRefreshed}
              methodology="All data sourced from official U.S. government APIs. Net Liquidity = Fed Balance Sheet − TGA − RRP."
            />
          </div>
        )}
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
      className="group panel flex items-start gap-3 p-4 transition-all duration-standard hover:border-primary/20 hover:shadow-panel-raised"
    >
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        bgColor,
        color
      )}>
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
