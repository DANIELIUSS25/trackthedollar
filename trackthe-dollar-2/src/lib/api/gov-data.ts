// src/lib/api/gov-data.ts
// Direct government API data fetching — no intermediary backend needed
// All data from official U.S. government sources

import type { TimeSeriesPoint } from "@/types/dollar";

// ─── Cache ─────────────────────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  setCache(key, data);
  return data;
}

// ─── FRED API ──────────────────────────────────────────────────────────────

const FRED_BASE = "https://api.stlouisfed.org";

interface FredObservation {
  date: string;
  value: string;
}

export async function fetchFredSeries(
  seriesId: string,
  options: { limit?: number; startDate?: string } = {}
): Promise<TimeSeriesPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return [];

  const cacheKey = `fred:${seriesId}:${options.limit}:${options.startDate}`;
  return fetchWithCache(cacheKey, async () => {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: apiKey,
      file_type: "json",
      sort_order: "desc",
      limit: String(options.limit ?? 500),
    });
    if (options.startDate) params.set("observation_start", options.startDate);

    const res = await fetch(`${FRED_BASE}/fred/series/observations?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.observations as FredObservation[])
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
      .reverse();
  });
}

// ─── Treasury Fiscal Data API ──────────────────────────────────────────────

const TREASURY_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";

interface TreasuryRecord {
  [key: string]: string;
}

export async function fetchTreasuryData(
  endpoint: string,
  options: {
    fields?: string;
    filter?: string;
    sort?: string;
    limit?: number;
  } = {}
): Promise<TreasuryRecord[]> {
  const cacheKey = `treasury:${endpoint}:${JSON.stringify(options)}`;
  return fetchWithCache(cacheKey, async () => {
    const params = new URLSearchParams({
      format: "json",
      "page[size]": String(options.limit ?? 500),
    });
    if (options.fields) params.set("fields", options.fields);
    if (options.filter) params.set("filter", options.filter);
    if (options.sort) params.set("sort", options.sort);

    const res = await fetch(`${TREASURY_BASE}${endpoint}?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as TreasuryRecord[];
  });
}

// ─── BLS API ───────────────────────────────────────────────────────────────

interface BlsSeriesData {
  year: string;
  period: string;
  value: string;
}

export async function fetchBlsSeries(
  seriesIds: string[],
  startYear?: number,
  endYear?: number
): Promise<Map<string, TimeSeriesPoint[]>> {
  const now = new Date();
  const start = startYear ?? now.getFullYear() - 5;
  const end = endYear ?? now.getFullYear();
  const cacheKey = `bls:${seriesIds.join(",")}:${start}:${end}`;

  return fetchWithCache(cacheKey, async () => {
    const apiKey = process.env.BLS_API_KEY;
    const url = apiKey
      ? "https://api.bls.gov/publicAPI/v2/timeseries/data/"
      : "https://api.bls.gov/publicAPI/v1/timeseries/data/";

    const body: Record<string, unknown> = {
      seriesid: seriesIds,
      startyear: String(start),
      endyear: String(end),
    };
    if (apiKey) body.registrationkey = apiKey;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return new Map();

    const json = await res.json();
    const result = new Map<string, TimeSeriesPoint[]>();

    for (const series of json.Results?.series ?? []) {
      const points: TimeSeriesPoint[] = (series.data as BlsSeriesData[])
        .filter((d) => d.period.startsWith("M") && d.period !== "M13")
        .map((d) => ({
          date: `${d.year}-${d.period.replace("M", "")}-01`,
          value: parseFloat(d.value),
        }))
        .reverse();
      result.set(series.seriesID, points);
    }
    return result;
  });
}

// ─── USASpending API ───────────────────────────────────────────────────────

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2";

export async function fetchDefenseSpending(): Promise<{
  budgetaryResources: TimeSeriesPoint[];
  obligations: TimeSeriesPoint[];
  outlays: TimeSeriesPoint[];
}> {
  const cacheKey = "usaspending:defense";
  return fetchWithCache(cacheKey, async () => {
    const currentFY = new Date().getMonth() >= 9
      ? new Date().getFullYear() + 1
      : new Date().getFullYear();

    const budgetaryResources: TimeSeriesPoint[] = [];
    const obligations: TimeSeriesPoint[] = [];
    const outlays: TimeSeriesPoint[] = [];

    for (let fy = currentFY - 5; fy <= currentFY; fy++) {
      try {
        const res = await fetch(
          `${USASPENDING_BASE}/agency/097/budgetary_resources/?fiscal_year=${fy}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) continue;
        const json = await res.json();
        const resources = json.agency_budgetary_resources?.[0];
        if (resources) {
          budgetaryResources.push({
            date: `${fy}-09-30`,
            value: resources.total_budgetary_resources ?? 0,
          });
          obligations.push({
            date: `${fy}-09-30`,
            value: resources.agency_total_obligated ?? 0,
          });
          outlays.push({
            date: `${fy}-09-30`,
            value: resources.agency_obligation ?? 0,
          });
        }
      } catch {
        continue;
      }
    }

    return { budgetaryResources, obligations, outlays };
  });
}

// ─── Foreign Assistance (USAID) ────────────────────────────────────────────

export async function fetchForeignAssistance(): Promise<{
  totalObligations: TimeSeriesPoint[];
  totalDisbursements: TimeSeriesPoint[];
  topCountries: Array<{ country: string; amount: number }>;
}> {
  const cacheKey = "usaid:foreign-assistance";
  return fetchWithCache(cacheKey, async () => {
    try {
      const res = await fetch(
        "https://data.usaid.gov/resource/k87i-9i5x.json?$limit=1000&$order=fiscal_year DESC",
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return { totalObligations: [], totalDisbursements: [], topCountries: [] };
      const data = await res.json();

      // Aggregate by fiscal year
      const byYear = new Map<string, { obligations: number; disbursements: number }>();
      const byCountry = new Map<string, number>();

      for (const row of data) {
        const fy = row.fiscal_year || row.Fiscal_Year;
        const country = row.country_name || row.Country_Name || "Unknown";
        const obligations = parseFloat(row.obligations || row.Obligations || "0");
        const disbursements = parseFloat(row.disbursements || row.Disbursements || "0");

        if (fy) {
          const existing = byYear.get(fy) ?? { obligations: 0, disbursements: 0 };
          existing.obligations += obligations;
          existing.disbursements += disbursements;
          byYear.set(fy, existing);
        }

        byCountry.set(country, (byCountry.get(country) ?? 0) + obligations);
      }

      const totalObligations = Array.from(byYear.entries())
        .map(([fy, v]) => ({ date: `${fy}-09-30`, value: v.obligations }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const totalDisbursements = Array.from(byYear.entries())
        .map(([fy, v]) => ({ date: `${fy}-09-30`, value: v.disbursements }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const topCountries = Array.from(byCountry.entries())
        .map(([country, amount]) => ({ country, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      return { totalObligations, totalDisbursements, topCountries };
    } catch {
      return { totalObligations: [], totalDisbursements: [], topCountries: [] };
    }
  });
}

// ─── Composite Data Fetchers ───────────────────────────────────────────────

/** Dollar Strength: DTWEXBGS (Trade-Weighted Broad Dollar Index) */
export async function fetchDollarStrength() {
  const series = await fetchFredSeries("DTWEXBGS", { limit: 500 });
  if (series.length === 0) return null;
  const latest = series[series.length - 1];
  const prev = series.length > 1 ? series[series.length - 2] : latest;
  const change = latest.value - prev.value;
  return {
    current: latest.value,
    change,
    changePercent: (change / prev.value) * 100,
    series,
    source: "FRED",
    seriesId: "DTWEXBGS",
  };
}

/** National Debt: Treasury Debt to the Penny */
export async function fetchNationalDebt() {
  const records = await fetchTreasuryData(
    "/v2/accounting/od/debt_to_penny",
    {
      fields: "record_date,tot_pub_debt_out_amt,debt_held_public_amt,intragov_hold_amt",
      sort: "-record_date",
      limit: 500,
    }
  );
  if (records.length === 0) return null;

  const series: TimeSeriesPoint[] = records
    .map((r) => ({
      date: r.record_date,
      value: parseFloat(r.tot_pub_debt_out_amt),
    }))
    .reverse();

  const latest = records[0];
  const prev = records.length > 1 ? records[1] : latest;
  const totalDebt = parseFloat(latest.tot_pub_debt_out_amt);
  const debtHeld = parseFloat(latest.debt_held_public_amt);
  const intragov = parseFloat(latest.intragov_hold_amt);
  const prevDebt = parseFloat(prev.tot_pub_debt_out_amt);

  return {
    totalDebt,
    debtHeldByPublic: debtHeld,
    intragovernmental: intragov,
    dailyChange: totalDebt - prevDebt,
    changePercent: ((totalDebt - prevDebt) / prevDebt) * 100,
    series,
    lastDate: latest.record_date,
    source: "Treasury Fiscal Data",
  };
}

/** Inflation: CPI All Items + Core CPI from BLS */
export async function fetchInflation() {
  const blsData = await fetchBlsSeries(["CUSR0000SA0", "CUSR0000SA0L1E"]);
  const cpiAll = blsData.get("CUSR0000SA0") ?? [];
  const cpiCore = blsData.get("CUSR0000SA0L1E") ?? [];

  // Also fetch breakeven inflation from FRED
  const breakeven = await fetchFredSeries("T5YIE", { limit: 250 });

  // Calculate YoY change for CPI
  let yoyChange = 0;
  if (cpiAll.length >= 13) {
    const current = cpiAll[cpiAll.length - 1].value;
    const yearAgo = cpiAll[cpiAll.length - 13].value;
    yoyChange = ((current - yearAgo) / yearAgo) * 100;
  }

  return {
    cpiAll,
    cpiCore,
    breakeven,
    yoyChange,
    latestCpi: cpiAll.length > 0 ? cpiAll[cpiAll.length - 1].value : null,
    latestCore: cpiCore.length > 0 ? cpiCore[cpiCore.length - 1].value : null,
    source: "Bureau of Labor Statistics",
  };
}

/** Interest Rates: Fed Funds + 2Y + 10Y from FRED */
export async function fetchInterestRates() {
  const [fedFunds, dgs2, dgs10] = await Promise.all([
    fetchFredSeries("DFF", { limit: 500 }),
    fetchFredSeries("DGS2", { limit: 500 }),
    fetchFredSeries("DGS10", { limit: 500 }),
  ]);

  const getLatest = (s: TimeSeriesPoint[]) =>
    s.length > 0 ? s[s.length - 1].value : null;

  const ff = getLatest(fedFunds);
  const y2 = getLatest(dgs2);
  const y10 = getLatest(dgs10);

  return {
    fedFunds: { current: ff, series: fedFunds, seriesId: "DFF" },
    treasury2Y: { current: y2, series: dgs2, seriesId: "DGS2" },
    treasury10Y: { current: y10, series: dgs10, seriesId: "DGS10" },
    yieldCurveSpread: y10 !== null && y2 !== null ? y10 - y2 : null,
    source: "FRED (Federal Reserve)",
  };
}

/** Money Supply: M2 + Fed Total Assets + Reserve Balances */
export async function fetchMoneySupply() {
  const [m2, walcl, reserves] = await Promise.all([
    fetchFredSeries("M2SL", { limit: 250 }),
    fetchFredSeries("WALCL", { limit: 250 }),
    fetchFredSeries("WRESBAL", { limit: 250 }),
  ]);

  return {
    m2: { series: m2, latest: m2.length > 0 ? m2[m2.length - 1].value : null, seriesId: "M2SL" },
    fedTotalAssets: { series: walcl, latest: walcl.length > 0 ? walcl[walcl.length - 1].value : null, seriesId: "WALCL" },
    reserveBalances: { series: reserves, latest: reserves.length > 0 ? reserves[reserves.length - 1].value : null, seriesId: "WRESBAL" },
    source: "FRED (Federal Reserve)",
  };
}

/** Overview: aggregate key metrics for dashboard */
export async function fetchOverview() {
  const [debt, dollarStrength, rates, money, inflation] = await Promise.all([
    fetchNationalDebt(),
    fetchDollarStrength(),
    fetchInterestRates(),
    fetchMoneySupply(),
    fetchInflation(),
  ]);

  return {
    debt,
    dollarStrength,
    rates,
    money,
    inflation,
    timestamp: new Date().toISOString(),
  };
}
