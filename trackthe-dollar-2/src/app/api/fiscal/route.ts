// src/app/api/fiscal/route.ts
import { NextResponse } from "next/server";
import {
  fetchFiscalSnapshot,
  fetchSpendingByCategory,
  fetchRevenueBySource,
} from "@/lib/api/treasury";
import { fetchMacroIndicator } from "@/lib/api/fred";
import { withCache } from "@/lib/cache/withCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [fiscal, spending, revenue, interestExpense] = await Promise.allSettled([
      withCache(() => fetchFiscalSnapshot(), { key: "fiscal:snapshot", ttl: 86400 }),
      withCache(() => fetchSpendingByCategory(), { key: "fiscal:spending", ttl: 86400 }),
      withCache(() => fetchRevenueBySource(), { key: "fiscal:revenue", ttl: 86400 }),
      withCache(
        () => fetchMacroIndicator("A091RC1Q027SBEA" as never, 40),
        { key: "fiscal:interest", ttl: 86400 }
      ),
    ]);

    const fiscalData = fiscal.status === "fulfilled" ? fiscal.value : null;
    const spendingData = spending.status === "fulfilled" ? spending.value : [];
    const revenueData = revenue.status === "fulfilled" ? revenue.value : [];
    const interestData = interestExpense.status === "fulfilled" ? interestExpense.value : null;

    return NextResponse.json({
      currentMonth: fiscalData?.currentMonth ?? null,
      fiscalYTD: fiscalData?.fiscalYTD ?? null,
      spendingByCategory: spendingData.slice(0, 12),
      revenueBySource: revenueData.slice(0, 8),
      interestExpense: {
        value: interestData?.latestValue ?? null,
        change: interestData?.change ?? null,
        changePercent: interestData?.changePercent ?? null,
        series: interestData?.series ?? [],
        lastUpdated: interestData?.latestDate ?? null,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Fiscal API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch fiscal data" },
      { status: 500 }
    );
  }
}
