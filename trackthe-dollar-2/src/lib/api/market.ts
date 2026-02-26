// src/lib/api/market.ts
import type { Quote, OHLCVBar, HistoricalData, Mover, MarketMovers, SearchResult, TimeRange } from "@/types/market";

const POLYGON_BASE = "https://api.polygon.io";
const AV_BASE = "https://www.alphavantage.co";

function polygonKey(): string {
  const key = process.env.POLYGON_API_KEY;
  if (!key) throw new Error("POLYGON_API_KEY is not configured");
  return key;
}

function avKey(): string {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error("ALPHA_VANTAGE_API_KEY is not configured");
  return key;
}

/**
 * Fetch with timeout + retries. Never exposes API keys in errors.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  retries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);
      if (res.ok) return res;
      // Don't retry 4xx — only retry 5xx and network errors
      if (res.status >= 400 && res.status < 500) return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export async function fetchQuote(symbol: string): Promise<Quote> {
  // Polygon snapshot endpoint
  const url = `${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(symbol)}?apiKey=${polygonKey()}`;
  const res = await fetchWithTimeout(url);

  if (res.status === 404) throw new Error(`Symbol not found: ${symbol}`);
  if (!res.ok) throw new Error(`Market data unavailable (HTTP ${res.status})`);

  const json = await res.json() as PolygonSnapshotResponse;
  return mapPolygonSnapshotToQuote(json.ticker, symbol);
}

// ─── Historical data ──────────────────────────────────────────────────────────

const RANGE_TO_PARAMS: Record<TimeRange, { multiplier: number; timespan: string; days: number }> = {
  "1D":  { multiplier: 5,  timespan: "minute", days: 1   },
  "5D":  { multiplier: 30, timespan: "minute", days: 5   },
  "1M":  { multiplier: 1,  timespan: "day",    days: 30  },
  "3M":  { multiplier: 1,  timespan: "day",    days: 90  },
  "6M":  { multiplier: 1,  timespan: "day",    days: 180 },
  "1Y":  { multiplier: 1,  timespan: "day",    days: 365 },
  "5Y":  { multiplier: 1,  timespan: "week",   days: 1825},
};

export async function fetchHistoricalData(
  symbol: string,
  range: TimeRange
): Promise<HistoricalData> {
  const { multiplier, timespan, days } = RANGE_TO_PARAMS[range];
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const toStr = to.toISOString().split("T")[0];
  const fromStr = from.toISOString().split("T")[0];

  const url = `${POLYGON_BASE}/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/${multiplier}/${timespan}/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=5000&apiKey=${polygonKey()}`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) throw new Error(`Failed to fetch historical data (HTTP ${res.status})`);

  const json = await res.json() as PolygonAggsResponse;
  const bars: OHLCVBar[] = (json.results ?? []).map((r) => ({
    timestamp: r.t,
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));

  return { symbol, range, bars };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const url = `${POLYGON_BASE}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=20&apiKey=${polygonKey()}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Search failed (HTTP ${res.status})`);

  const json = await res.json() as PolygonTickerSearchResponse;
  return (json.results ?? []).slice(0, 15).map((t) => ({
    symbol: t.ticker,
    name: t.name,
    exchange: t.primary_exchange ?? "",
    assetClass: mapPolygonMarketType(t.market, t.type),
    currency: t.currency_name ?? "USD",
  }));
}

// ─── Movers ───────────────────────────────────────────────────────────────────

export async function fetchMarketMovers(): Promise<MarketMovers> {
  const url = `${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${polygonKey()}`;
  const losersUrl = `${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${polygonKey()}`;

  const [gainersRes, losersRes] = await Promise.all([
    fetchWithTimeout(url),
    fetchWithTimeout(losersUrl),
  ]);

  if (!gainersRes.ok || !losersRes.ok) {
    throw new Error("Failed to fetch market movers");
  }

  const [gainersJson, losersJson] = await Promise.all([
    gainersRes.json() as Promise<PolygonMoversResponse>,
    losersRes.json() as Promise<PolygonMoversResponse>,
  ]);

  const mapMover = (t: PolygonTicker): Mover => ({
    symbol: t.ticker,
    name: t.ticker, // Polygon movers don't include names; enrich separately if needed
    price: t.day.c,
    change: t.todaysChange,
    changePercent: t.todaysChangePerc,
    volume: t.day.v,
    assetClass: "stock",
  });

  const gainers = (gainersJson.tickers ?? []).slice(0, 10).map(mapMover);
  const losers = (losersJson.tickers ?? []).slice(0, 10).map(mapMover);

  // Most active = union of both sorted by volume desc
  const allMovers = [...gainers, ...losers];
  const mostActive = [...allMovers]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return { gainers, losers, mostActive, updatedAt: new Date().toISOString() };
}

// ─── Polygon response types (private — not exported) ─────────────────────────

interface PolygonSnapshotResponse {
  ticker: PolygonTicker;
}

interface PolygonMoversResponse {
  tickers: PolygonTicker[];
}

interface PolygonTicker {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  day: {
    o: number; h: number; l: number; c: number; v: number;
  };
  prevDay: {
    o: number; h: number; l: number; c: number; v: number;
  };
  lastQuote: { P: number; S: number; p: number; s: number };
  min?: { o: number; h: number; l: number; c: number; v: number };
}

interface PolygonAggsResponse {
  results?: Array<{
    t: number; o: number; h: number; l: number; c: number; v: number;
  }>;
}

interface PolygonTickerSearchResponse {
  results?: Array<{
    ticker: string;
    name: string;
    market: string;
    type: string;
    primary_exchange?: string;
    currency_name?: string;
  }>;
}

function mapPolygonSnapshotToQuote(ticker: PolygonTicker, symbol: string): Quote {
  const price = ticker.day.c || ticker.lastQuote?.P || 0;
  const prevClose = ticker.prevDay.c || 0;
  const change = price - prevClose;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    name: symbol, // Enrich with reference endpoint for full name in production
    price,
    open: ticker.day.o,
    high: ticker.day.h,
    low: ticker.day.l,
    previousClose: prevClose,
    change,
    changePercent,
    volume: ticker.day.v,
    avgVolume: ticker.day.v, // Would need separate reference endpoint for true avg
    marketCap: null,
    pe: null,
    week52High: 0, // Polygon reference endpoint: /v3/reference/tickers/{ticker}
    week52Low: 0,
    assetClass: "stock",
    exchange: "US",
    currency: "USD",
    updatedAt: new Date().toISOString(),
  };
}

function mapPolygonMarketType(
  market: string,
  type: string
): Quote["assetClass"] {
  if (market === "crypto") return "crypto";
  if (market === "fx") return "forex";
  if (type === "ETF" || type === "ETV") return "etf";
  if (type === "INDEX") return "index";
  return "stock";
}

// ─── Alpha Vantage fallback (for symbols Polygon doesn't cover) ──────────────

export async function fetchQuoteAV(symbol: string): Promise<Quote> {
  const url = `${AV_BASE}/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${avKey()}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Alpha Vantage request failed (HTTP ${res.status})`);

  const json = await res.json() as AVGlobalQuoteResponse;
  const q = json["Global Quote"];

  if (!q || !q["05. price"]) {
    throw new Error(`Symbol not found: ${symbol}`);
  }

  const price = parseFloat(q["05. price"]);
  const prevClose = parseFloat(q["08. previous close"]);
  const change = parseFloat(q["09. change"]);
  const changePercent = parseFloat(q["10. change percent"].replace("%", ""));

  return {
    symbol,
    name: symbol,
    price,
    open: parseFloat(q["02. open"]),
    high: parseFloat(q["03. high"]),
    low: parseFloat(q["04. low"]),
    previousClose: prevClose,
    change,
    changePercent,
    volume: parseInt(q["06. volume"], 10),
    avgVolume: 0,
    marketCap: null,
    pe: null,
    week52High: 0,
    week52Low: 0,
    assetClass: "stock",
    exchange: "US",
    currency: "USD",
    updatedAt: new Date().toISOString(),
  };
}

interface AVGlobalQuoteResponse {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}
