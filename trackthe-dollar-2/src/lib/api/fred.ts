// src/lib/api/fred.ts
import type { MacroIndicator, MacroIndicatorId, MacroDataPoint, FedMeeting } from "@/types/macro";

const FRED_BASE = "https://api.stlouisfed.org/fred";

function fredKey(): string {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY is not configured");
  return key;
}

async function fredFetch<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${FRED_BASE}${path}${separator}api_key=${fredKey()}&file_type=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`FRED API error (HTTP ${res.status})`);
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Indicator metadata map ────────────────────────────────────────────────────

const INDICATOR_META: Record<
  MacroIndicatorId,
  { title: string; description: string; units: string; frequency: MacroIndicator["frequency"] }
> = {
  FEDFUNDS:  { title: "Fed Funds Rate",              description: "Effective Federal Funds Rate",                    units: "%",       frequency: "monthly"   },
  CPIAUCSL:  { title: "CPI (All Items)",              description: "Consumer Price Index, All Urban Consumers",       units: "Index",   frequency: "monthly"   },
  UNRATE:    { title: "Unemployment Rate",            description: "Civilian Unemployment Rate",                      units: "%",       frequency: "monthly"   },
  GDP:       { title: "Real GDP",                     description: "Real Gross Domestic Product",                     units: "Bil $",   frequency: "quarterly" },
  T10YIE:    { title: "10Y Breakeven Inflation",      description: "10-Year Breakeven Inflation Rate",                units: "%",       frequency: "daily"     },
  DGS10:     { title: "10Y Treasury Yield",           description: "10-Year Treasury Constant Maturity Rate",         units: "%",       frequency: "daily"     },
  DGS2:      { title: "2Y Treasury Yield",            description: "2-Year Treasury Constant Maturity Rate",          units: "%",       frequency: "daily"     },
  T10Y2Y:    { title: "Yield Curve (10Y-2Y)",         description: "10-Year Minus 2-Year Treasury Constant Maturity", units: "%",       frequency: "daily"     },
  WALCL:     { title: "Fed Balance Sheet",            description: "Assets: Total Assets: Total Assets",              units: "Mil $",   frequency: "weekly"    },
  M2SL:      { title: "M2 Money Supply",              description: "M2 Money Stock",                                  units: "Bil $",   frequency: "monthly"   },
};

// ─── Fetch single indicator ────────────────────────────────────────────────────

export async function fetchMacroIndicator(
  id: MacroIndicatorId,
  limit = 60
): Promise<MacroIndicator> {
  const [seriesRes, obsRes] = await Promise.all([
    fredFetch<FredSeriesResponse>(`/series?series_id=${id}`),
    fredFetch<FredObsResponse>(`/series/observations?series_id=${id}&sort_order=desc&limit=${limit}`),
  ]);

  const observations = obsRes.observations.filter(
    (o) => o.value !== "." && o.value !== ""
  );

  const series: MacroDataPoint[] = observations
    .map((o) => ({
      date: o.date,
      value: o.value === "." ? null : parseFloat(o.value),
    }))
    .reverse(); // Return in chronological order

  const latest = observations[0];
  const previous = observations[1];

  const latestValue = latest ? parseFloat(latest.value) : null;
  const previousValue = previous ? parseFloat(previous.value) : null;
  const change =
    latestValue !== null && previousValue !== null
      ? latestValue - previousValue
      : null;
  const changePercent =
    change !== null && previousValue !== null && previousValue !== 0
      ? (change / Math.abs(previousValue)) * 100
      : null;

  const meta = INDICATOR_META[id];

  return {
    id,
    title: seriesRes.seriess?.[0]?.title ?? meta.title,
    description: meta.description,
    units: seriesRes.seriess?.[0]?.units ?? meta.units,
    frequency: meta.frequency,
    latestValue,
    latestDate: latest?.date ?? null,
    previousValue,
    change,
    changePercent,
    series,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Fetch multiple indicators ────────────────────────────────────────────────

export async function fetchMacroIndicators(
  ids: MacroIndicatorId[]
): Promise<MacroIndicator[]> {
  // Fetch concurrently but cap parallelism to avoid rate limiting
  const BATCH = 5;
  const results: MacroIndicator[] = [];

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map((id) => fetchMacroIndicator(id, 24))
    );
    for (const result of settled) {
      if (result.status === "fulfilled") results.push(result.value);
    }
  }

  return results;
}

// ─── Fed meetings (FOMC) ──────────────────────────────────────────────────────

export async function fetchFedMeetings(): Promise<FedMeeting[]> {
  // FOMC meetings are encoded in the FEDFUNDS series change dates
  const obs = await fredFetch<FredObsResponse>(
    `/series/observations?series_id=FEDFUNDS&sort_order=desc&limit=30`
  );

  const validObs = obs.observations.filter(
    (o) => o.value !== "." && o.value !== ""
  );

  const meetings: FedMeeting[] = [];

  for (let i = 0; i < validObs.length - 1; i++) {
    const current = validObs[i]!;
    const prior = validObs[i + 1]!;

    const rateAfter = parseFloat(current.value);
    const rateBefore = parseFloat(prior.value);
    const bps = Math.round((rateAfter - rateBefore) * 100);

    if (bps !== 0) {
      meetings.push({
        date: current.date,
        decision: bps > 0 ? "hike" : "cut",
        rateBefore,
        rateAfter,
        bps,
        statementUrl: null, // Would require FOMC press releases API
      });
    }
  }

  return meetings;
}

// ─── FRED response types ──────────────────────────────────────────────────────

interface FredObsResponse {
  observations: Array<{
    date: string;
    value: string;
  }>;
}

interface FredSeriesResponse {
  seriess?: Array<{
    id: string;
    title: string;
    units: string;
    frequency: string;
    last_updated: string;
  }>;
}
