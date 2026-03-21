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

/** Safe fetch with timeout and error handling */
async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    console.error(`[gov-data] Fetch failed for ${url}:`, err);
    return null;
  }
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
  if (!apiKey) {
    console.warn(`[gov-data] FRED_API_KEY not set — skipping ${seriesId}`);
    return [];
  }

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

    const res = await safeFetch(`${FRED_BASE}/fred/series/observations?${params}`);
    if (!res || !res.ok) return [];
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

    const res = await safeFetch(`${TREASURY_BASE}${endpoint}?${params}`);
    if (!res || !res.ok) return [];
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

    const res = await safeFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res || !res.ok) return new Map();

    const json = await res.json();
    const result = new Map<string, TimeSeriesPoint[]>();

    for (const series of json.Results?.series ?? []) {
      const points: TimeSeriesPoint[] = (series.data as BlsSeriesData[])
        .filter((d: BlsSeriesData) => d.period.startsWith("M") && d.period !== "M13")
        .map((d: BlsSeriesData) => ({
          date: `${d.year}-${d.period.replace("M", "").padStart(2, "0")}-01`,
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
        const res = await safeFetch(
          `${USASPENDING_BASE}/agency/097/budgetary_resources/?fiscal_year=${fy}`
        );
        if (!res || !res.ok) continue;
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
      const res = await safeFetch(
        "https://data.usaid.gov/resource/k87i-9i5x.json?$limit=1000&$order=fiscal_year DESC"
      );
      if (!res || !res.ok) return { totalObligations: [], totalDisbursements: [], topCountries: [] };
      const data = await res.json();

      const byYear = new Map<string, { obligations: number; disbursements: number }>();
      const byCountry = new Map<string, number>();

      for (const row of data) {
        const fy = row.fiscal_year || row.Fiscal_Year;
        const country = row.country_name || row.Country_Name || "Unknown";
        const obligs = parseFloat(row.obligations || row.Obligations || "0");
        const disburse = parseFloat(row.disbursements || row.Disbursements || "0");

        if (fy) {
          const existing = byYear.get(fy) ?? { obligations: 0, disbursements: 0 };
          existing.obligations += obligs;
          existing.disbursements += disburse;
          byYear.set(fy, existing);
        }

        byCountry.set(country, (byCountry.get(country) ?? 0) + obligs);
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
  if (series.length === 0) {
    return {
      current: null,
      change: null,
      changePercent: null,
      series: [],
      source: "FRED",
      seriesId: "DTWEXBGS",
      warning: !process.env.FRED_API_KEY ? "FRED_API_KEY not configured" : "No data available",
    };
  }
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
    warning: null,
  };
}

/** National Debt: Treasury Debt to the Penny (NO API KEY NEEDED) */
export async function fetchNationalDebt() {
  const records = await fetchTreasuryData(
    "/v2/accounting/od/debt_to_penny",
    {
      fields: "record_date,tot_pub_debt_out_amt,debt_held_public_amt,intragov_hold_amt",
      sort: "-record_date",
      limit: 500,
    }
  );
  if (records.length === 0) {
    return {
      totalDebt: null,
      debtHeldByPublic: null,
      intragovernmental: null,
      dailyChange: null,
      changePercent: null,
      series: [],
      lastDate: null,
      source: "Treasury Fiscal Data",
      warning: "Unable to reach Treasury Fiscal Data API",
    };
  }

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

  // Use a 30-day rolling average for dailyChange so the live counter never
  // freezes on days when the Treasury debt dips day-over-day.
  const window30 = records.length >= 30 ? records[29] : prev;
  const debt30DaysAgo = parseFloat(window30.tot_pub_debt_out_amt);
  const days30 = Math.max(records.length >= 30 ? 29 : 1, 1);
  const avgDailyChange = (totalDebt - debt30DaysAgo) / days30;
  // Fall back to single-day diff only if the 30-day average is non-positive
  const dailyChange = avgDailyChange > 0 ? avgDailyChange : Math.max(totalDebt - prevDebt, 0);

  return {
    totalDebt,
    debtHeldByPublic: debtHeld,
    intragovernmental: intragov,
    dailyChange,
    changePercent: ((totalDebt - prevDebt) / prevDebt) * 100,
    series,
    lastDate: latest.record_date,
    source: "Treasury Fiscal Data",
    warning: null,
  };
}

/** Inflation: CPI All Items + Core CPI from BLS (no key required for v1) */
export async function fetchInflation() {
  const blsData = await fetchBlsSeries(["CUSR0000SA0", "CUSR0000SA0L1E"]);
  const cpiAll = blsData.get("CUSR0000SA0") ?? [];
  const cpiCore = blsData.get("CUSR0000SA0L1E") ?? [];

  // Also fetch breakeven inflation from FRED (needs key)
  const breakeven = await fetchFredSeries("T5YIE", { limit: 250 });

  // Calculate YoY change for CPI
  let yoyChange = 0;
  if (cpiAll.length >= 13) {
    const current = cpiAll[cpiAll.length - 1].value;
    const yearAgo = cpiAll[cpiAll.length - 13].value;
    yoyChange = ((current - yearAgo) / yearAgo) * 100;
  }

  const warnings: string[] = [];
  if (cpiAll.length === 0) warnings.push("BLS API unavailable or returned no data");
  if (breakeven.length === 0 && !process.env.FRED_API_KEY) warnings.push("FRED_API_KEY not set — breakeven inflation unavailable");

  return {
    cpiAll,
    cpiCore,
    breakeven,
    yoyChange,
    latestCpi: cpiAll.length > 0 ? cpiAll[cpiAll.length - 1].value : null,
    latestCore: cpiCore.length > 0 ? cpiCore[cpiCore.length - 1].value : null,
    source: "Bureau of Labor Statistics",
    warnings,
  };
}

/** Interest Rates: Fed Funds + 2Y + 10Y from FRED (needs key) */
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
    warning: !process.env.FRED_API_KEY ? "FRED_API_KEY not configured — rates data unavailable" : null,
  };
}

/** Money Supply: M2 + Fed Total Assets + Reserve Balances (needs key) */
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
    warning: !process.env.FRED_API_KEY ? "FRED_API_KEY not configured — money supply data unavailable" : null,
  };
}

/** US Average Retail Gas Price from EIA (no API key needed) */
export async function fetchGasPrice(): Promise<{ price: number | null; date: string | null; source: string }> {
  return fetchWithCache("gas-price", async () => {
    // EIA Open Data API v2 — Weekly Retail Gasoline & Diesel Prices
    // Series: EMD_EPD2D_PTE_NUS_DPG (US regular conventional gas, $/gal)
    const url = "https://api.eia.gov/v2/petroleum/pri/gnd/data/?frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=1&api_key=DEMO_KEY";
    const res = await safeFetch(url);
    if (!res?.ok) return { price: null, date: null, source: "EIA" };
    try {
      const json = await res.json();
      const row = json?.response?.data?.[0];
      return {
        price: row?.value != null ? parseFloat(row.value) : null,
        date: row?.period ?? null,
        source: "EIA (Energy Information Administration)",
      };
    } catch {
      return { price: null, date: null, source: "EIA" };
    }
  });
}

/** Overview: aggregate key metrics for dashboard */
export async function fetchOverview() {
  const [debt, dollarStrength, rates, money, inflation, gasPrice] = await Promise.all([
    fetchNationalDebt(),
    fetchDollarStrength(),
    fetchInterestRates(),
    fetchMoneySupply(),
    fetchInflation(),
    fetchGasPrice(),
  ]);

  const warnings: string[] = [];
  if (!process.env.FRED_API_KEY) warnings.push("FRED_API_KEY not set — FRED-dependent data (dollar index, rates, money supply) will be unavailable");
  if (debt.warning) warnings.push(debt.warning);

  return {
    debt,
    dollarStrength,
    rates,
    money,
    inflation,
    gasPrice,
    warnings,
    timestamp: new Date().toISOString(),
  };
}
