import { NextResponse } from "next/server";
import { fetchDefenseSpending } from "@/lib/api/gov-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchDefenseSpending();
    return NextResponse.json({ data, metadata: { timestamp: new Date().toISOString() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
