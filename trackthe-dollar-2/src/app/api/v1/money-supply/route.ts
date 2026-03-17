import { NextResponse } from "next/server";
import { fetchMoneySupply } from "@/lib/api/gov-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchMoneySupply();
    return NextResponse.json({
      data,
      metadata: { timestamp: new Date().toISOString() },
      warnings: data.warning ? [data.warning] : [],
    });
  } catch (e) {
    console.error("[api/v1/money-supply]", e);
    return NextResponse.json(
      { error: String(e), data: null, warnings: ["API error"] },
      { status: 500 }
    );
  }
}
