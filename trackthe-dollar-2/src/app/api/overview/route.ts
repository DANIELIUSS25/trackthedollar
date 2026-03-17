// src/app/api/overview/route.ts
// Dashboard overview — aggregates key metrics from all data sources
import { NextResponse } from "next/server";
import { fetchMacroIndicator } from "@/lib/api/fred";
import { fetchDebtSnapshot, fetchTGABalance } from "@/lib/api/treasury";
import { withCache } from "@/lib/cache/withCache";
import type { MacroIndicatorId } from "@/types/macro";
import { formatCompact } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all key metrics in parallel
    const [
      debt,
      fedBs,
      rrp,
      tga,
      fedFunds,
      dgs10,
      _dgs2,
      yieldCurve,
      m2,
      cpi,
    ] = await Promise.allSettled([
      withCache(() => fetchDebtSnapshot(), { key: "overview:debt", ttl: 3600 }),
      withCache(
        () => fetchMacroIndicator("WALCL" as MacroIndicatorId, 30),
        { key: "overview:fed_bs", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("RRPONTSYD" as never, 30),
        { key: "overview:rrp", ttl: 3600 }
      ),
      withCache(() => fetchTGABalance(), { key: "overview:tga", ttl: 3600 }),
      withCache(
        () => fetchMacroIndicator("FEDFUNDS" as MacroIndicatorId, 30),
        { key: "overview:fed_funds", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("DGS10" as MacroIndicatorId, 30),
        { key: "overview:dgs10", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("DGS2" as MacroIndicatorId, 30),
        { key: "overview:dgs2", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("T10Y2Y" as MacroIndicatorId, 30),
        { key: "overview:yield_curve", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("M2SL" as MacroIndicatorId, 24),
        { key: "overview:m2", ttl: 86400 }
      ),
      withCache(
        () => fetchMacroIndicator("CPIAUCSL" as MacroIndicatorId, 24),
        { key: "overview:cpi", ttl: 86400 }
      ),
    ]);

    const debtData = debt.status === "fulfilled" ? debt.value : null;
    const fedBsData = fedBs.status === "fulfilled" ? fedBs.value : null;
    const rrpData = rrp.status === "fulfilled" ? rrp.value : null;
    const tgaData = tga.status === "fulfilled" ? tga.value : null;
    const fedFundsData = fedFunds.status === "fulfilled" ? fedFunds.value : null;
    const dgs10Data = dgs10.status === "fulfilled" ? dgs10.value : null;
    const yieldCurveData = yieldCurve.status === "fulfilled" ? yieldCurve.value : null;
    const m2Data = m2.status === "fulfilled" ? m2.value : null;
    const cpiData = cpi.status === "fulfilled" ? cpi.value : null;

    // Calculate net liquidity
    const fedBsBillions = fedBsData?.latestValue ? fedBsData.latestValue / 1000 : 0;
    const tgaBillions = tgaData?.balance ? tgaData.balance / 1_000_000_000 : 0;
    const rrpBillions = rrpData?.latestValue ? rrpData.latestValue / 1000 : 0;
    const netLiquidity = fedBsBillions - tgaBillions - rrpBillions;

    const metrics = [
      {
        id: "total_debt",
        label: "National Debt",
        value: debtData?.totalPublicDebt ?? 0,
        formattedValue: debtData ? `$${formatCompact(debtData.totalPublicDebt)}` : "—",
        change: null,
        changePercent: null,
        changeDirection: "neutral" as const,
        invertColor: true,
        unit: "USD",
        sparkline: [] as Array<{ date: string; value: number }>,
        source: "treasury_fiscal_data" as const,
        lastUpdated: debtData?.date ?? "",
        href: "/debt",
      },
      {
        id: "fed_balance_sheet",
        label: "Fed Balance Sheet",
        value: fedBsBillions * 1_000_000_000,
        formattedValue: `$${fedBsBillions.toFixed(2)}T`,
        change: fedBsData?.change ? fedBsData.change / 1000 : null,
        changePercent: fedBsData?.changePercent ?? null,
        changeDirection: getDirection(fedBsData?.change),
        invertColor: false,
        unit: "USD",
        sparkline: (fedBsData?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value / 1000 })),
        source: "fred" as const,
        lastUpdated: fedBsData?.latestDate ?? "",
        href: "/liquidity",
      },
      {
        id: "tga",
        label: "Treasury General Account",
        value: tgaData?.balance ?? 0,
        formattedValue: tgaData ? `$${(tgaData.balance / 1_000_000_000).toFixed(0)}B` : "—",
        change: null,
        changePercent: null,
        changeDirection: "neutral" as const,
        invertColor: false,
        unit: "USD",
        sparkline: [] as Array<{ date: string; value: number }>,
        source: "treasury_fiscal_data" as const,
        lastUpdated: tgaData?.date ?? "",
        href: "/liquidity",
      },
      {
        id: "rrp",
        label: "Reverse Repo (RRP)",
        value: rrpBillions * 1_000_000_000,
        formattedValue: `$${rrpBillions.toFixed(0)}B`,
        change: rrpData?.change ? rrpData.change / 1000 : null,
        changePercent: rrpData?.changePercent ?? null,
        changeDirection: getDirection(rrpData?.change),
        invertColor: false,
        unit: "USD",
        sparkline: (rrpData?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value / 1000 })),
        source: "fred" as const,
        lastUpdated: rrpData?.latestDate ?? "",
        href: "/liquidity",
      },
      {
        id: "net_liquidity",
        label: "Net Liquidity",
        value: netLiquidity * 1_000_000_000,
        formattedValue: `$${netLiquidity.toFixed(2)}T`,
        change: null,
        changePercent: null,
        changeDirection: "neutral" as const,
        invertColor: false,
        unit: "USD",
        sparkline: [] as Array<{ date: string; value: number }>,
        source: "calculated" as const,
        lastUpdated: new Date().toISOString(),
        href: "/liquidity",
      },
      {
        id: "fed_funds",
        label: "Fed Funds Rate",
        value: fedFundsData?.latestValue ?? 0,
        formattedValue: fedFundsData?.latestValue ? `${fedFundsData.latestValue.toFixed(2)}%` : "—",
        change: fedFundsData?.change ?? null,
        changePercent: fedFundsData?.changePercent ?? null,
        changeDirection: getDirection(fedFundsData?.change),
        invertColor: false,
        unit: "%",
        sparkline: (fedFundsData?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value })),
        source: "fred" as const,
        lastUpdated: fedFundsData?.latestDate ?? "",
        href: "/liquidity",
      },
      {
        id: "dgs10",
        label: "10Y Treasury Yield",
        value: dgs10Data?.latestValue ?? 0,
        formattedValue: dgs10Data?.latestValue ? `${dgs10Data.latestValue.toFixed(2)}%` : "—",
        change: dgs10Data?.change ?? null,
        changePercent: dgs10Data?.changePercent ?? null,
        changeDirection: getDirection(dgs10Data?.change),
        invertColor: false,
        unit: "%",
        sparkline: (dgs10Data?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value })),
        source: "fred" as const,
        lastUpdated: dgs10Data?.latestDate ?? "",
        href: "/debt",
      },
      {
        id: "yield_curve",
        label: "Yield Curve (10Y-2Y)",
        value: yieldCurveData?.latestValue ?? 0,
        formattedValue: yieldCurveData?.latestValue
          ? `${yieldCurveData.latestValue > 0 ? "+" : ""}${yieldCurveData.latestValue.toFixed(2)}%`
          : "—",
        change: yieldCurveData?.change ?? null,
        changePercent: yieldCurveData?.changePercent ?? null,
        changeDirection: getDirection(yieldCurveData?.change),
        invertColor: false,
        unit: "%",
        sparkline: (yieldCurveData?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value })),
        source: "fred" as const,
        lastUpdated: yieldCurveData?.latestDate ?? "",
        href: "/debt",
      },
      {
        id: "m2",
        label: "M2 Money Supply",
        value: (m2Data?.latestValue ?? 0) * 1_000_000_000,
        formattedValue: m2Data?.latestValue ? `$${(m2Data.latestValue / 1000).toFixed(2)}T` : "—",
        change: m2Data?.change ?? null,
        changePercent: m2Data?.changePercent ?? null,
        changeDirection: getDirection(m2Data?.change),
        invertColor: false,
        unit: "USD",
        sparkline: (m2Data?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value })),
        source: "fred" as const,
        lastUpdated: m2Data?.latestDate ?? "",
        href: "/liquidity",
      },
      {
        id: "cpi",
        label: "CPI (Inflation)",
        value: cpiData?.latestValue ?? 0,
        formattedValue: cpiData?.latestValue ? cpiData.latestValue.toFixed(1) : "—",
        change: cpiData?.change ?? null,
        changePercent: cpiData?.changePercent ?? null,
        changeDirection: getDirection(cpiData?.change),
        invertColor: true,
        unit: "Index",
        sparkline: (cpiData?.series ?? [])
          .filter((p): p is { date: string; value: number } => p.value !== null)
          .map((p) => ({ date: p.date, value: p.value })),
        source: "fred" as const,
        lastUpdated: cpiData?.latestDate ?? "",
        href: "/fiscal",
      },
    ];

    return NextResponse.json({
      metrics,
      lastRefreshed: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Overview API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}

function getDirection(
  change: number | null | undefined
): "positive" | "negative" | "neutral" {
  if (change === null || change === undefined || change === 0) return "neutral";
  return change > 0 ? "positive" : "negative";
}
