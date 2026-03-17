import { NextResponse } from "next/server";
import { fetchForeignAssistance } from "@/lib/api/gov-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchForeignAssistance();
    return NextResponse.json({ data, metadata: { timestamp: new Date().toISOString() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
