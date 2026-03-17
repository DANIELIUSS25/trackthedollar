import { NextResponse } from "next/server";
import { fetchDefenseSpending } from "@/lib/api/gov-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchDefenseSpending();
    const warnings: string[] = [];
    if (data.budgetaryResources.length === 0) warnings.push("Unable to reach USAspending API");
    return NextResponse.json({
      data,
      metadata: { timestamp: new Date().toISOString() },
      warnings,
    });
  } catch (e) {
    console.error("[api/v1/defense-spending]", e);
    return NextResponse.json(
      { error: String(e), data: null, warnings: ["API error"] },
      { status: 500 }
    );
  }
}
