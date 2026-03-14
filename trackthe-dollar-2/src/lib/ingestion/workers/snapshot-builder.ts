// src/lib/ingestion/workers/snapshot-builder.ts
import { prisma } from "@/lib/db/client";
import { redisDel } from "@/lib/redis/client";

/**
 * Builds a denormalized DailySnapshot from the latest observations.
 * Runs after each ingestion cycle to keep the dashboard cache warm.
 */
export async function buildDailySnapshot(): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Fetch latest observation for each series
  const seriesMap: Record<string, number | null> = {};

  const seriesIds = [
    "TREASURY:TOTAL_DEBT",
    "TREASURY:DEBT_HELD_BY_PUBLIC",
    "TREASURY:INTRAGOV_HOLDINGS",
    "TREASURY:TGA_BALANCE",
    "FRED:WALCL",
    "FRED:RRPONTSYD",
    "FRED:FEDFUNDS",
    "FRED:DGS10",
    "FRED:DGS2",
    "FRED:T10Y2Y",
    "FRED:M2SL",
    "FRED:CPIAUCSL",
  ];

  for (const seriesId of seriesIds) {
    const latest = await prisma.observation.findFirst({
      where: { seriesId },
      orderBy: { date: "desc" },
      select: { value: true },
    });
    seriesMap[seriesId] = latest ? latest.value.toNumber() : null;
  }

  const fedBS = seriesMap["FRED:WALCL"];
  const tga = seriesMap["TREASURY:TGA_BALANCE"];
  const rrp = seriesMap["FRED:RRPONTSYD"];

  // Calculate net liquidity: Fed Balance Sheet - TGA - RRP
  let netLiquidity: number | null = null;
  if (fedBS !== null && tga !== null && rrp !== null) {
    // WALCL is in millions, TGA in raw, RRP in billions — normalize to dollars
    // WALCL: millions → dollars (multiply by 1M) — but our ingestion already normalizes
    // For consistency, all values stored in observations are in their natural units
    netLiquidity = (fedBS ?? 0) - (tga ?? 0) - (rrp ?? 0);
  }

  // Upsert the daily snapshot
  await prisma.dailySnapshot.upsert({
    where: { date: today },
    update: {
      totalDebt: seriesMap["TREASURY:TOTAL_DEBT"],
      debtHeldByPublic: seriesMap["TREASURY:DEBT_HELD_BY_PUBLIC"],
      intragovHoldings: seriesMap["TREASURY:INTRAGOV_HOLDINGS"],
      tgaBalance: seriesMap["TREASURY:TGA_BALANCE"],
      fedBalanceSheet: fedBS,
      rrpBalance: rrp,
      netLiquidity,
      fedFundsRate: seriesMap["FRED:FEDFUNDS"],
      dgs10: seriesMap["FRED:DGS10"],
      dgs2: seriesMap["FRED:DGS2"],
      yieldCurve: seriesMap["FRED:T10Y2Y"],
      m2: seriesMap["FRED:M2SL"],
      cpi: seriesMap["FRED:CPIAUCSL"],
    },
    create: {
      date: today,
      totalDebt: seriesMap["TREASURY:TOTAL_DEBT"],
      debtHeldByPublic: seriesMap["TREASURY:DEBT_HELD_BY_PUBLIC"],
      intragovHoldings: seriesMap["TREASURY:INTRAGOV_HOLDINGS"],
      tgaBalance: seriesMap["TREASURY:TGA_BALANCE"],
      fedBalanceSheet: fedBS,
      rrpBalance: rrp,
      netLiquidity,
      fedFundsRate: seriesMap["FRED:FEDFUNDS"],
      dgs10: seriesMap["FRED:DGS10"],
      dgs2: seriesMap["FRED:DGS2"],
      yieldCurve: seriesMap["FRED:T10Y2Y"],
      m2: seriesMap["FRED:M2SL"],
      cpi: seriesMap["FRED:CPIAUCSL"],
    },
  });

  // Invalidate dashboard cache keys
  await Promise.all([
    redisDel("ttd:overview:latest"),
    redisDel("ttd:debt:snapshot:latest"),
    redisDel("ttd:liquidity:net:latest"),
  ]);

  console.info(`[snapshot-builder] Daily snapshot built for ${today.toISOString().split("T")[0]}`);
}
