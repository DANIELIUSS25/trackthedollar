import { NextResponse } from "next/server";
import { fetchForeignAssistance } from "@/lib/api/gov-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchForeignAssistance();
    const warnings: string[] = [];
    if (data.totalObligations.length === 0) warnings.push("Unable to reach USAID data portal");
    return NextResponse.json({
      data,
      metadata: { timestamp: new Date().toISOString() },
      warnings,
    });
  } catch (e) {
    console.error("[api/v1/foreign-assistance]", e);
    return NextResponse.json(
      { error: String(e), data: null, warnings: ["API error"] },
      { status: 500 }
    );
  }
}
