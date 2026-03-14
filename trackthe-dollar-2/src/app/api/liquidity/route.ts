// src/app/api/liquidity/route.ts
import { NextResponse } from "next/server";
import { fetchMacroIndicator } from "@/lib/api/fred";
import { fetchTGABalance, fetchTGAHistory } from "@/lib/api/treasury";
import { withCache } from "@/lib/cache/withCache";
import type { MacroIndicatorId } from "@/types/macro";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [fedBs, rrp, tga, tgaHistory, m2] = await Promise.allSettled([
      withCache(
        () => fetchMacroIndicator("WALCL" as MacroIndicatorId, 60),
        { key: "liquidity:fed_bs", ttl: 3600 }
      ),
      withCache(
        () => fetchMacroIndicator("RRPONTSYD" as never, 60),
        { key: "liquidity:rrp", ttl: 3600 }
      ),
      withCache(() => fetchTGABalance(), { key: "liquidity:tga", ttl: 3600 }),
      withCache(() => fetchTGAHistory(365), { key: "liquidity:tga_history", ttl: 3600 }),
      withCache(
        () => fetchMacroIndicator("M2SL" as MacroIndicatorId, 24),
        { key: "liquidity:m2", ttl: 86400 }
      ),
    ]);

    const fedBsData = fedBs.status === "fulfilled" ? fedBs.value : null;
    const rrpData = rrp.status === "fulfilled" ? rrp.value : null;
    const tgaData = tga.status === "fulfilled" ? tga.value : null;
    const tgaHistoryData = tgaHistory.status === "fulfilled" ? tgaHistory.value : [];
    const m2Data = m2.status === "fulfilled" ? m2.value : null;

    // Calculate net liquidity: Fed BS - TGA - RRP
    const fedBsValue = fedBsData?.latestValue ?? 0;
    const tgaValue = tgaData?.balance ?? 0;
    const rrpValue = rrpData?.latestValue ?? 0;

    // WALCL is in millions, TGA from treasury is in raw dollars, RRP in billions
    // Normalize everything to billions for display
    const fedBsBillions = fedBsValue / 1000; // WALCL in millions -> billions
    const tgaBillions = tgaValue / 1_000_000_000; // Raw -> billions
    const rrpBillions = rrpValue / 1000; // Millions -> billions (FRED reports in millions)

    const netLiquidity = fedBsBillions - tgaBillions - rrpBillions;

    // Build net liquidity history from Fed BS series
    const netLiquidityHistory = (fedBsData?.series ?? []).map((point) => ({
      date: point.date,
      value: point.value !== null ? point.value / 1000 : 0, // Millions -> billions
    }));

    return NextResponse.json({
      fedBalanceSheet: {
        value: fedBsBillions,
        change: fedBsData?.change ? fedBsData.change / 1000 : null,
        changePercent: fedBsData?.changePercent ?? null,
        series: fedBsData?.series ?? [],
        lastUpdated: fedBsData?.latestDate ?? null,
      },
      tga: {
        value: tgaBillions,
        date: tgaData?.date ?? null,
        series: tgaHistoryData.map((p) => ({
          date: p.date,
          value: p.value / 1_000_000_000,
        })),
      },
      rrp: {
        value: rrpBillions,
        change: rrpData?.change ? rrpData.change / 1000 : null,
        changePercent: rrpData?.changePercent ?? null,
        series: (rrpData?.series ?? []).map((p) => ({
          date: p.date,
          value: p.value !== null ? p.value / 1000 : 0,
        })),
        lastUpdated: rrpData?.latestDate ?? null,
      },
      netLiquidity: {
        value: netLiquidity,
        series: netLiquidityHistory,
      },
      m2: {
        value: m2Data?.latestValue ?? null,
        change: m2Data?.change ?? null,
        changePercent: m2Data?.changePercent ?? null,
        series: m2Data?.series ?? [],
        lastUpdated: m2Data?.latestDate ?? null,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Liquidity API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch liquidity data" },
      { status: 500 }
    );
  }
}
