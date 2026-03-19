import { NextResponse } from "next/server";
import { fetchGovAlerts } from "@/lib/api/gov-alerts";

// Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const alerts = await fetchGovAlerts();
    return NextResponse.json({
      data: alerts,
      count: alerts.length,
      metadata: { timestamp: new Date().toISOString(), sources: 6 },
    });
  } catch (e) {
    console.error("[api/v1/alerts]", e);
    return NextResponse.json(
      { error: "Failed to fetch alerts", data: [], count: 0 },
      { status: 500 }
    );
  }
}
