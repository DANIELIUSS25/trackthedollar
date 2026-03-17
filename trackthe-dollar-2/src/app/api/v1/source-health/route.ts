import { NextResponse } from "next/server";

export const revalidate = 60;

interface SourceStatus {
  source: string;
  status: "healthy" | "degraded" | "down";
  lastCheck: string;
  latencyMs: number;
}

async function checkSource(name: string, url: string): Promise<SourceStatus> {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return {
      source: name,
      status: res.ok ? "healthy" : "degraded",
      lastCheck: new Date().toISOString(),
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      source: name,
      status: "down",
      lastCheck: new Date().toISOString(),
      latencyMs: Date.now() - start,
    };
  }
}

export async function GET() {
  const fredKey = process.env.FRED_API_KEY ?? "";
  const checks = await Promise.all([
    checkSource("FRED (Federal Reserve)", `https://api.stlouisfed.org/fred/series?series_id=DFF&api_key=${fredKey}&file_type=json`),
    checkSource("Treasury Fiscal Data", "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?page[size]=1"),
    checkSource("Bureau of Labor Statistics", "https://api.bls.gov/publicAPI/v2/timeseries/data/"),
    checkSource("USAspending", "https://api.usaspending.gov/api/v2/references/toptier_agencies/"),
    checkSource("Foreign Assistance (USAID)", "https://data.usaid.gov/resource/k87i-9i5x.json?$limit=1"),
  ]);

  const healthy = checks.filter((c) => c.status === "healthy").length;
  return NextResponse.json({
    data: {
      sources: checks,
      summary: { total: checks.length, healthy, degraded: checks.length - healthy },
    },
    metadata: { timestamp: new Date().toISOString() },
  });
}
