import { NextResponse } from "next/server";
import { fetchOverview } from "@/lib/api/gov-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchOverview();
    return NextResponse.json({
      data,
      metadata: { timestamp: new Date().toISOString() },
      warnings: data.warnings ?? [],
    });
  } catch (e) {
    console.error("[api/v1/overview]", e);
    return NextResponse.json(
      { error: "Failed to fetch overview", detail: String(e), data: null, warnings: ["API error"] },
      { status: 500 }
    );
  }
}
