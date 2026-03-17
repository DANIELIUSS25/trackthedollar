import { NextResponse } from "next/server";
import { fetchInflation } from "@/lib/api/gov-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchInflation();
    return NextResponse.json({
      data,
      metadata: { timestamp: new Date().toISOString() },
      warnings: data.warnings ?? [],
    });
  } catch (e) {
    console.error("[api/v1/inflation]", e);
    return NextResponse.json(
      { error: String(e), data: null, warnings: ["API error"] },
      { status: 500 }
    );
  }
}
