import { NextResponse } from "next/server";
import { fetchMoneySupply } from "@/lib/api/gov-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchMoneySupply();
    return NextResponse.json({ data, metadata: { timestamp: new Date().toISOString() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
