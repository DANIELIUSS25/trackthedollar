// src/app/api/debt/route.ts
import { NextResponse } from "next/server";
import { fetchDebtSnapshot, fetchDebtHistory } from "@/lib/api/treasury";
import { fetchMacroIndicator } from "@/lib/api/fred";
import { withCache } from "@/lib/cache/withCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [snapshot, history, debtToGdp] = await Promise.allSettled([
      withCache(() => fetchDebtSnapshot(), { key: "debt:snapshot", ttl: 3600 }),
      withCache(() => fetchDebtHistory(365), { key: "debt:history", ttl: 3600 }),
      withCache(
        () => fetchMacroIndicator("GFDEGDQ188S" as never, 20),
        { key: "debt:gdp_ratio", ttl: 86400 }
      ),
    ]);

    const debtData = snapshot.status === "fulfilled" ? snapshot.value : null;
    const historyData = history.status === "fulfilled" ? history.value : [];
    const gdpRatio = debtToGdp.status === "fulfilled" ? debtToGdp.value : null;

    // Calculate changes from history
    let dailyChange = 0;
    let monthlyChange = 0;
    let yearlyChange = 0;
    let avgDailyIncrease = 0;

    if (historyData.length > 1) {
      const latest = historyData[historyData.length - 1]!;
      const prior = historyData[historyData.length - 2]!;
      dailyChange = latest.value - prior.value;

      const thirtyDaysAgo = historyData.length > 30 ? historyData[historyData.length - 31] : null;
      if (thirtyDaysAgo) {
        monthlyChange = latest.value - thirtyDaysAgo.value;
        avgDailyIncrease = monthlyChange / 30;
      }

      const firstEntry = historyData[0]!;
      yearlyChange = latest.value - firstEntry.value;
    }

    return NextResponse.json({
      current: debtData,
      debtToGdp: gdpRatio?.latestValue ?? null,
      dailyChange,
      monthlyChange,
      yearlyChange,
      averageDailyIncrease30d: avgDailyIncrease,
      history: historyData,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Debt API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch debt data" },
      { status: 500 }
    );
  }
}
