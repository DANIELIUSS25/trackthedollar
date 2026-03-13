"use client";

import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/charts/MetricCard";
import { BarBreakdownChart } from "@/components/charts/BarBreakdownChart";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { FiscalSnapshot, SpendingCategory, RevenueSource } from "@/types/dollar";

interface FiscalResponse {
  currentMonth: FiscalSnapshot | null;
  fiscalYTD: FiscalSnapshot | null;
  spendingByCategory: SpendingCategory[];
  revenueBySource: RevenueSource[];
  interestExpense: {
    value: number | null;
    change: number | null;
    changePercent: number | null;
    series: Array<{ date: string; value: number | null }>;
    lastUpdated: string | null;
  };
  updatedAt: string;
}

function formatBillions(v: number): string {
  if (Math.abs(v) >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(v) >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

const SPENDING_COLORS = [
  "#ea3943", "#f0b429", "#3b82f6", "#16c784", "#8b5cf6",
  "#ec4899", "#f97316", "#06b6d4", "#84cc16", "#6366f1",
  "#a855f7", "#14b8a6",
];

const REVENUE_COLORS = [
  "#16c784", "#f0b429", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f97316", "#06b6d4", "#84cc16",
];

export default function FiscalPage() {
  const { data, isLoading, error, refetch } = useQuery<FiscalResponse>({
    queryKey: ["fiscal"],
    queryFn: async () => {
      const res = await fetch("/api/fiscal");
      if (!res.ok) throw new Error("Failed to fetch fiscal data");
      return res.json();
    },
    refetchInterval: 600_000,
    staleTime: 300_000,
  });

  return (
    <>
      <TopBar title="Fiscal Flows" subtitle="Federal Receipts, Outlays & Budget Deficit">
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
            <p className="text-sm">Failed to load fiscal data</p>
            <button onClick={() => refetch()} className="text-xs underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Current Month Summary */}
            {data.currentMonth && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Latest Month ({data.currentMonth.period})
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MetricCard
                    label="Monthly Receipts"
                    value={formatBillions(data.currentMonth.totalReceipts)}
                    subtitle="Total federal revenue this month"
                  />
                  <MetricCard
                    label="Monthly Outlays"
                    value={formatBillions(data.currentMonth.totalOutlays)}
                    subtitle="Total federal spending this month"
                    invertColor
                  />
                  <MetricCard
                    label="Monthly Surplus/Deficit"
                    value={formatBillions(data.currentMonth.surplus_deficit)}
                    change={data.currentMonth.surplus_deficit}
                    subtitle={
                      data.currentMonth.surplus_deficit >= 0 ? "Monthly surplus" : "Monthly deficit"
                    }
                  />
                </div>
              </section>
            )}

            {/* Fiscal Year to Date */}
            {data.fiscalYTD && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fiscal Year to Date ({data.fiscalYTD.period})
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="FYTD Receipts"
                    value={formatBillions(data.fiscalYTD.totalReceipts)}
                  />
                  <MetricCard
                    label="FYTD Outlays"
                    value={formatBillions(data.fiscalYTD.totalOutlays)}
                    invertColor
                  />
                  <MetricCard
                    label="FYTD Deficit"
                    value={formatBillions(data.fiscalYTD.surplus_deficit)}
                    change={data.fiscalYTD.surplus_deficit}
                    subtitle={
                      data.fiscalYTD.surplus_deficit >= 0
                        ? "Running surplus"
                        : "Running deficit"
                    }
                  />
                  <MetricCard
                    label="Interest Expense"
                    value={
                      data.interestExpense.value
                        ? `$${data.interestExpense.value.toFixed(0)}B`
                        : "—"
                    }
                    change={data.interestExpense.change}
                    changePercent={data.interestExpense.changePercent}
                    invertColor
                    subtitle="Quarterly annualized (FRED)"
                  />
                </div>
              </section>
            )}

            {/* Spending by Category */}
            {data.spendingByCategory.length > 0 && (
              <BarBreakdownChart
                data={data.spendingByCategory.slice(0, 10).map((cat, i) => ({
                  label:
                    cat.category.length > 30
                      ? cat.category.substring(0, 27) + "..."
                      : cat.category,
                  value: Math.abs(cat.amount),
                  color: SPENDING_COLORS[i % SPENDING_COLORS.length],
                }))}
                title="FYTD Spending by Category (Top 10)"
                height={350}
                formatValue={formatBillions}
              />
            )}

            {/* Revenue by Source */}
            {data.revenueBySource.length > 0 && (
              <BarBreakdownChart
                data={data.revenueBySource.slice(0, 8).map((src, i) => ({
                  label:
                    src.source.length > 30
                      ? src.source.substring(0, 27) + "..."
                      : src.source,
                  value: Math.abs(src.amount),
                  color: REVENUE_COLORS[i % REVENUE_COLORS.length],
                }))}
                title="FYTD Revenue by Source"
                height={300}
                formatValue={formatBillions}
              />
            )}

            {/* Spending Table */}
            {data.spendingByCategory.length > 0 && (
              <div className="panel overflow-hidden">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Spending Detail
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                          Category
                        </th>
                        <th className="px-4 py-2 text-right text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                          FYTD Amount
                        </th>
                        <th className="px-4 py-2 text-right text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                          % of Total
                        </th>
                        <th className="px-4 py-2 text-right text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                          YoY Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.spendingByCategory.map((cat) => (
                        <tr
                          key={cat.category}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="px-4 py-2 text-xs text-foreground">
                            {cat.category}
                          </td>
                          <td className="px-4 py-2 text-right font-data text-xs">
                            {formatBillions(Math.abs(cat.amount))}
                          </td>
                          <td className="px-4 py-2 text-right font-data text-xs text-muted-foreground">
                            {cat.percentOfTotal.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-right font-data text-xs">
                            {cat.yoyChange !== null ? (
                              <span
                                className={
                                  cat.yoyChange > 0
                                    ? "text-negative"
                                    : cat.yoyChange < 0
                                      ? "text-positive"
                                      : "text-muted-foreground"
                                }
                              >
                                {cat.yoyChange > 0 ? "+" : ""}
                                {cat.yoyChange.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Interest Expense Chart */}
            {data.interestExpense.series.length > 0 && (
              <TimeSeriesChart
                data={data.interestExpense.series.filter(
                  (p): p is { date: string; value: number } => p.value !== null
                )}
                label="Federal Interest Payments (Quarterly, Annualized)"
                color="#ea3943"
                height={300}
                formatValue={(v) => `$${v.toFixed(0)}B`}
              />
            )}

            {/* Source */}
            <div className="rounded-md border border-border bg-card/50 p-3">
              <p className="text-2xs text-muted-foreground">
                Data sources: U.S. Treasury Monthly Treasury Statement (FiscalData API), FRED
                (A091RC1Q027SBEA). Fiscal year runs Oct 1 — Sep 30.{" "}
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
