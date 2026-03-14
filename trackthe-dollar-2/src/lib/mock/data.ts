// src/lib/mock/data.ts — Realistic mock data for TrackTheDollar
// All values modeled on real U.S. government data (March 2026 estimates)

import type { TimeSeriesPoint } from "@/types/dollar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSeries(
  startDate: string,
  points: number,
  startValue: number,
  volatility: number,
  trend: number = 0
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  let value = startValue;
  const start = new Date(startDate);
  for (let i = 0; i < points; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i * Math.ceil(365 / points));
    value += trend + (Math.random() - 0.48) * volatility;
    result.push({ date: date.toISOString().split("T")[0], value: Math.round(value * 100) / 100 });
  }
  return result;
}

function generateMonthlySeries(
  startYear: number,
  months: number,
  startValue: number,
  monthlyTrend: number,
  volatility: number
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  let value = startValue;
  for (let i = 0; i < months; i++) {
    const year = startYear + Math.floor(i / 12);
    const month = (i % 12) + 1;
    value += monthlyTrend + (Math.random() - 0.45) * volatility;
    result.push({
      date: `${year}-${String(month).padStart(2, "0")}-01`,
      value: Math.round(value),
    });
  }
  return result;
}

// ─── Dashboard KPI Data ───────────────────────────────────────────────────────

export const MOCK_KPI_METRICS = [
  {
    id: "total_debt",
    label: "National Debt",
    value: 36_218_000_000_000,
    formattedValue: "$36.22T",
    change: 4_700_000_000,
    changePercent: 0.013,
    changeDirection: "positive" as const,
    invertColor: true,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 60, 34.5e12, 8e10, 2.8e10),
    source: "treasury_fiscal_data" as const,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    href: "/debt",
  },
  {
    id: "fed_balance_sheet",
    label: "Fed Balance Sheet",
    value: 6_820_000_000_000,
    formattedValue: "$6.82T",
    change: -18_000_000_000,
    changePercent: -0.26,
    changeDirection: "negative" as const,
    invertColor: false,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 60, 7.4e12, 3e10, -1.2e10),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    href: "/liquidity",
  },
  {
    id: "tga",
    label: "TGA Balance",
    value: 782_000_000_000,
    formattedValue: "$782B",
    change: 23_000_000_000,
    changePercent: 3.03,
    changeDirection: "positive" as const,
    invertColor: true,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 60, 650e9, 40e9, 2e9),
    source: "treasury_fiscal_data" as const,
    lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    href: "/liquidity",
  },
  {
    id: "rrp",
    label: "Reverse Repo (RRP)",
    value: 147_000_000_000,
    formattedValue: "$147B",
    change: -12_000_000_000,
    changePercent: -7.55,
    changeDirection: "negative" as const,
    invertColor: false,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 60, 800e9, 30e9, -12e9),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    href: "/liquidity",
  },
  {
    id: "net_liquidity",
    label: "Net Liquidity",
    value: 5_891_000_000_000,
    formattedValue: "$5.89T",
    change: -29_000_000_000,
    changePercent: -0.49,
    changeDirection: "negative" as const,
    invertColor: false,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 60, 5.6e12, 5e10, 5e9),
    source: "calculated" as const,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    href: "/liquidity",
  },
  {
    id: "fed_funds",
    label: "Fed Funds Rate",
    value: 4.33,
    formattedValue: "4.33%",
    change: 0,
    changePercent: 0,
    changeDirection: "neutral" as const,
    unit: "%",
    sparkline: generateSeries("2025-03-01", 24, 5.33, 0.02, -0.04),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    href: "/macro",
  },
  {
    id: "dgs10",
    label: "10Y Treasury",
    value: 4.32,
    formattedValue: "4.32%",
    change: -0.03,
    changePercent: -0.69,
    changeDirection: "negative" as const,
    unit: "%",
    sparkline: generateSeries("2025-03-01", 60, 4.5, 0.08, -0.003),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    href: "/macro",
  },
  {
    id: "yield_curve",
    label: "Yield Curve (10Y-2Y)",
    value: 0.17,
    formattedValue: "+17 bps",
    change: 0.02,
    changePercent: 13.3,
    changeDirection: "positive" as const,
    unit: "bps",
    sparkline: generateSeries("2025-03-01", 60, -0.5, 0.05, 0.01),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    href: "/macro",
  },
  {
    id: "m2",
    label: "M2 Money Supply",
    value: 21_670_000_000_000,
    formattedValue: "$21.67T",
    change: 89_000_000_000,
    changePercent: 0.41,
    changeDirection: "positive" as const,
    invertColor: true,
    unit: "USD",
    sparkline: generateSeries("2025-03-01", 24, 20.8e12, 6e10, 3.6e10),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 2592000000).toISOString(),
    href: "/macro",
  },
  {
    id: "cpi",
    label: "CPI (YoY)",
    value: 2.8,
    formattedValue: "2.8%",
    change: -0.1,
    changePercent: -3.45,
    changeDirection: "negative" as const,
    invertColor: false,
    unit: "%",
    sparkline: generateSeries("2025-03-01", 24, 3.4, 0.1, -0.025),
    source: "fred" as const,
    lastUpdated: new Date(Date.now() - 2592000000).toISOString(),
    href: "/macro",
  },
  {
    id: "deficit_ytd",
    label: "Deficit (FYTD)",
    value: -1_830_000_000_000,
    formattedValue: "-$1.83T",
    change: -142_000_000_000,
    changePercent: -8.41,
    changeDirection: "negative" as const,
    invertColor: true,
    unit: "USD",
    sparkline: generateMonthlySeries(2025, 12, -200e9, -160e9, 30e9),
    source: "treasury_fiscal_data" as const,
    lastUpdated: new Date(Date.now() - 604800000).toISOString(),
    href: "/fiscal",
  },
  {
    id: "interest_expense",
    label: "Interest on Debt (Ann.)",
    value: 1_120_000_000_000,
    formattedValue: "$1.12T",
    change: 47_000_000_000,
    changePercent: 4.38,
    changeDirection: "positive" as const,
    invertColor: true,
    unit: "USD",
    sparkline: generateMonthlySeries(2023, 36, 700e9, 12e9, 3e9),
    source: "treasury_fiscal_data" as const,
    lastUpdated: new Date(Date.now() - 2592000000).toISOString(),
    href: "/fiscal",
  },
];

// ─── What Changed Today ──────────────────────────────────────────────────────

export const MOCK_DAILY_CHANGES = [
  {
    id: "debt_change",
    metric: "National Debt",
    direction: "up" as const,
    magnitude: "$4.7B",
    context: "Treasury issued $12B in 10Y notes; $7.3B matured",
    invertSentiment: true,
  },
  {
    id: "tga_change",
    metric: "TGA Balance",
    direction: "up" as const,
    magnitude: "$23B",
    context: "Tax receipts + auction settlements exceeded spending",
    invertSentiment: true,
  },
  {
    id: "rrp_change",
    metric: "Reverse Repo",
    direction: "down" as const,
    magnitude: "$12B",
    context: "Continued structural drainage as MMFs deploy into T-bills",
    invertSentiment: false,
  },
  {
    id: "10y_change",
    metric: "10Y Yield",
    direction: "down" as const,
    magnitude: "3 bps",
    context: "Flight to safety after weaker-than-expected payrolls",
  },
  {
    id: "curve_change",
    metric: "Yield Curve",
    direction: "up" as const,
    magnitude: "2 bps",
    context: "Bear steepening: long-end selling outpaces short-end",
  },
];

// ─── Event Feed ──────────────────────────────────────────────────────────────

export const MOCK_EVENTS = [
  {
    id: "1",
    date: new Date().toISOString(),
    title: "Treasury auctions $58B in 3-month bills",
    detail: "Bid-to-cover 2.89x; high rate 4.235%. Strong indirect demand at 62.3%.",
    type: "auction" as const,
  },
  {
    id: "2",
    date: new Date(Date.now() - 3600000).toISOString(),
    title: "Daily Treasury Statement published",
    detail: "Operating cash balance: $782B. Net change: +$23B from tax receipts.",
    type: "data_release" as const,
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000).toISOString(),
    title: "Fed H.4.1 release: balance sheet at $6.82T",
    detail: "QT continues at ~$60B/month pace. MBS runoff below cap.",
    type: "policy" as const,
  },
  {
    id: "4",
    date: new Date(Date.now() - 172800000).toISOString(),
    title: "February CPI: 2.8% YoY (vs 2.9% est.)",
    detail: "Core CPI at 3.1% YoY. Shelter inflation moderating at +4.6%.",
    type: "data_release" as const,
  },
  {
    id: "5",
    date: new Date(Date.now() - 259200000).toISOString(),
    title: "Monthly Treasury Statement: February deficit -$307B",
    detail: "Receipts $271B (-4% YoY). Outlays $578B (+8% YoY). Interest: $76B.",
    type: "fiscal" as const,
  },
  {
    id: "6",
    date: new Date(Date.now() - 432000000).toISOString(),
    title: "Treasury announces April-June borrowing estimate: $847B",
    detail: "Net marketable borrowing revised up $52B from January estimate.",
    type: "auction" as const,
  },
  {
    id: "7",
    date: new Date(Date.now() - 604800000).toISOString(),
    title: "FOMC minutes: Committee sees risks as 'roughly balanced'",
    detail: "Markets pricing 2 cuts in 2026. Dot plot median unchanged at 3.9%.",
    type: "policy" as const,
  },
];

// ─── AI Briefing ─────────────────────────────────────────────────────────────

export const MOCK_AI_BRIEFING = {
  title: "Daily Intelligence Summary",
  summary: `The U.S. national debt crossed $36.22 trillion today as the Treasury settled $12 billion in new 10-year notes while $7.3 billion in maturing securities rolled off. The net issuance continues the elevated borrowing pace projected in the Treasury's latest Quarterly Refunding Announcement.

Net liquidity — the key market plumbing metric calculated as Fed Balance Sheet ($6.82T) minus TGA ($782B) minus RRP ($147B) — stands at $5.89T, down $29B week-over-week. The Fed's QT continues draining ~$60B/month from the system while the reverse repo facility has largely normalized, leaving bank reserves as the primary liquidity buffer.

The yield curve steepened to +17bps (10Y-2Y), its widest positive spread since mid-2024. February's CPI print of 2.8% keeps the Fed on hold, with markets pricing the first cut for July 2026. Watch next week's $42B 10-year auction and February retail sales for directional signals.`,
  sources: ["Treasury.gov", "FRED (St. Louis Fed)", "FiscalData API", "CBO Projections"],
  generatedAt: new Date().toISOString(),
};

// ─── Featured Charts Data ────────────────────────────────────────────────────

export const MOCK_DEBT_HISTORY = generateMonthlySeries(2020, 72, 23.2e12, 180e9, 20e9);
export const MOCK_NET_LIQUIDITY_HISTORY = generateSeries("2020-01-01", 260, 3.2e12, 8e10, 1e10);
export const MOCK_DEFICIT_HISTORY = generateMonthlySeries(2020, 72, -100e9, -5e9, 80e9);
export const MOCK_INTEREST_HISTORY = generateMonthlySeries(2020, 72, 380e9, 10e9, 2e9);

export const MOCK_YIELD_CURVE_CURRENT = [
  { label: "1M", value: 4.31 },
  { label: "3M", value: 4.24 },
  { label: "6M", value: 4.18 },
  { label: "1Y", value: 4.09 },
  { label: "2Y", value: 4.15 },
  { label: "3Y", value: 4.12 },
  { label: "5Y", value: 4.16 },
  { label: "7Y", value: 4.22 },
  { label: "10Y", value: 4.32 },
  { label: "20Y", value: 4.58 },
  { label: "30Y", value: 4.52 },
];

// ─── Dollar Flow Visualization Data ──────────────────────────────────────────

export const MOCK_DOLLAR_FLOWS = {
  sources: [
    { id: "tax_receipts", label: "Tax Receipts", value: 4_900_000_000_000, color: "#16c784" },
    { id: "treasury_issuance", label: "Treasury Issuance", value: 8_400_000_000_000, color: "#f0b429" },
    { id: "fed_operations", label: "Fed Operations", value: 960_000_000_000, color: "#3b82f6" },
  ],
  destinations: [
    { id: "mandatory", label: "Mandatory Spending", value: 4_100_000_000_000, color: "#ea3943" },
    { id: "discretionary", label: "Discretionary", value: 1_800_000_000_000, color: "#f97316" },
    { id: "interest", label: "Interest on Debt", value: 1_120_000_000_000, color: "#8b5cf6" },
    { id: "debt_rollover", label: "Debt Rollover", value: 7_200_000_000_000, color: "#6b7a99" },
  ],
  tga: 782_000_000_000,
};

// ─── Spending Breakdown ──────────────────────────────────────────────────────

export const MOCK_SPENDING_CATEGORIES = [
  { label: "Social Security", value: 1_460_000_000_000, color: "#f0b429", pctOfTotal: 23.4 },
  { label: "Health (Medicare/Medicaid)", value: 1_680_000_000_000, color: "#ea3943", pctOfTotal: 26.9 },
  { label: "Interest on Debt", value: 1_120_000_000_000, color: "#8b5cf6", pctOfTotal: 17.9 },
  { label: "National Defense", value: 886_000_000_000, color: "#3b82f6", pctOfTotal: 14.2 },
  { label: "Income Security", value: 490_000_000_000, color: "#16c784", pctOfTotal: 7.8 },
  { label: "Veterans Benefits", value: 325_000_000_000, color: "#06b6d4", pctOfTotal: 5.2 },
  { label: "Education", value: 168_000_000_000, color: "#ec4899", pctOfTotal: 2.7 },
  { label: "Other", value: 121_000_000_000, color: "#6b7a99", pctOfTotal: 1.9 },
];

// ─── Revenue Breakdown ───────────────────────────────────────────────────────

export const MOCK_REVENUE_SOURCES = [
  { label: "Individual Income Tax", value: 2_430_000_000_000, color: "#f0b429", pctOfTotal: 49.6 },
  { label: "Payroll Tax (FICA)", value: 1_680_000_000_000, color: "#3b82f6", pctOfTotal: 34.3 },
  { label: "Corporate Income Tax", value: 420_000_000_000, color: "#16c784", pctOfTotal: 8.6 },
  { label: "Excise & Customs", value: 195_000_000_000, color: "#8b5cf6", pctOfTotal: 4.0 },
  { label: "Other Revenue", value: 175_000_000_000, color: "#6b7a99", pctOfTotal: 3.5 },
];

// ─── Research Summaries ──────────────────────────────────────────────────────

export const MOCK_RESEARCH_ITEMS = [
  {
    id: "r1",
    title: "Interest Expense Surpasses Defense Spending",
    summary:
      "For the first time in U.S. history, annual interest payments on federal debt ($1.12T) have exceeded the entire defense budget ($886B). This structural shift means servicing past borrowing now consumes 17.9% of all federal spending.",
    category: "fiscal" as const,
    date: "2026-03-10",
    metric: "$1.12T vs $886B",
  },
  {
    id: "r2",
    title: "Reverse Repo Facility Nears Zero: Liquidity Implications",
    summary:
      "The Fed's overnight reverse repo facility has fallen from its $2.55T peak (Dec 2022) to just $147B. As this liquidity buffer depletes, future QT will directly drain bank reserves — potentially triggering funding market stress similar to September 2019.",
    category: "liquidity" as const,
    date: "2026-03-08",
    metric: "$147B (from $2.55T peak)",
  },
  {
    id: "r3",
    title: "Debt-to-GDP Approaches 130%: Historical Context",
    summary:
      "The U.S. debt-to-GDP ratio stands at 127.4%, approaching levels only seen during WWII (118.9% in 1946). Unlike the post-war period, today's trajectory is accelerating — CBO projects 156% by 2034 under current law.",
    category: "debt" as const,
    date: "2026-03-05",
    metric: "127.4% debt-to-GDP",
  },
];

// ─── Forecast Teasers ────────────────────────────────────────────────────────

export const MOCK_FORECASTS = [
  {
    id: "f1",
    metric: "National Debt",
    current: "$36.22T",
    projected: "$39.4T",
    horizon: "End of FY2027",
    source: "CBO Baseline",
    trend: "up" as const,
  },
  {
    id: "f2",
    metric: "Interest Expense",
    current: "$1.12T/yr",
    projected: "$1.38T/yr",
    horizon: "FY2027",
    source: "CBO Projection",
    trend: "up" as const,
  },
  {
    id: "f3",
    metric: "Fed Balance Sheet",
    current: "$6.82T",
    projected: "$6.2T",
    horizon: "End of QT",
    source: "FOMC Projections",
    trend: "down" as const,
  },
  {
    id: "f4",
    metric: "Fed Funds Rate",
    current: "4.33%",
    projected: "3.58%",
    horizon: "End of 2026",
    source: "Fed Dot Plot",
    trend: "down" as const,
  },
];

// ─── Source Confidence Data ──────────────────────────────────────────────────

export const MOCK_SOURCE_CONFIDENCE = [
  {
    source: "U.S. Treasury — Debt to the Penny",
    frequency: "Daily (business days)",
    lastUpdate: new Date(Date.now() - 3600000).toISOString(),
    reliability: "high" as const,
    latencyMs: 342,
    coverage: "National debt, composition",
  },
  {
    source: "Federal Reserve FRED",
    frequency: "Varies (daily to quarterly)",
    lastUpdate: new Date(Date.now() - 86400000).toISOString(),
    reliability: "high" as const,
    latencyMs: 189,
    coverage: "Rates, Fed BS, money supply, employment",
  },
  {
    source: "Treasury FiscalData API",
    frequency: "Daily (DTS) / Monthly (MTS)",
    lastUpdate: new Date(Date.now() - 7200000).toISOString(),
    reliability: "high" as const,
    latencyMs: 456,
    coverage: "TGA, receipts, outlays, spending",
  },
  {
    source: "Bureau of Labor Statistics",
    frequency: "Monthly",
    lastUpdate: new Date(Date.now() - 2592000000).toISOString(),
    reliability: "high" as const,
    latencyMs: 267,
    coverage: "CPI, employment, wages",
  },
  {
    source: "Congressional Budget Office",
    frequency: "Quarterly / Annual",
    lastUpdate: new Date(Date.now() - 7776000000).toISOString(),
    reliability: "medium" as const,
    latencyMs: 0,
    coverage: "Projections, baseline estimates",
  },
];

// ─── Ticker Items ────────────────────────────────────────────────────────────

export const MOCK_TICKER_ITEMS = [
  { label: "NAT'L DEBT", value: "$36.218T", change: 0.013 },
  { label: "FED BS", value: "$6.82T", change: -0.26 },
  { label: "TGA", value: "$782B", change: 3.03 },
  { label: "RRP", value: "$147B", change: -7.55 },
  { label: "NET LIQ", value: "$5.89T", change: -0.49 },
  { label: "10Y", value: "4.32%", change: -0.69 },
  { label: "2Y", value: "4.15%", change: -0.24 },
  { label: "SPREAD", value: "+17 bps", change: 13.3 },
  { label: "FED FUNDS", value: "4.33%", change: 0 },
  { label: "CPI", value: "2.8%", change: -3.45 },
  { label: "M2", value: "$21.67T", change: 0.41 },
  { label: "DEFICIT/YR", value: "-$1.83T", change: -8.41 },
  { label: "INTEREST", value: "$1.12T", change: 4.38 },
];

// ─── Dashboard Timeframe Options ─────────────────────────────────────────────

export const TIMEFRAME_OPTIONS = [
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "5Y", label: "5Y" },
] as const;

// ─── Main Chart Series Options ───────────────────────────────────────────────

export const CHART_SERIES_OPTIONS = [
  { id: "net_liquidity", label: "Net Liquidity", color: "#f0b429" },
  { id: "total_debt", label: "National Debt", color: "#ea3943" },
  { id: "fed_bs", label: "Fed Balance Sheet", color: "#3b82f6" },
  { id: "tga", label: "TGA Balance", color: "#16c784" },
  { id: "rrp", label: "Reverse Repo", color: "#8b5cf6" },
  { id: "deficit", label: "Cumulative Deficit", color: "#f97316" },
  { id: "interest", label: "Interest Expense", color: "#ec4899" },
] as const;

export function getChartData(seriesId: string): TimeSeriesPoint[] {
  switch (seriesId) {
    case "net_liquidity":
      return MOCK_NET_LIQUIDITY_HISTORY;
    case "total_debt":
      return MOCK_DEBT_HISTORY;
    case "fed_bs":
      return generateSeries("2020-01-01", 260, 4.2e12, 5e10, 1e10);
    case "tga":
      return generateSeries("2020-01-01", 260, 400e9, 40e9, 1.5e9);
    case "rrp":
      return generateSeries("2020-01-01", 260, 0, 15e9, 2e9);
    case "deficit":
      return MOCK_DEFICIT_HISTORY;
    case "interest":
      return MOCK_INTEREST_HISTORY;
    default:
      return MOCK_NET_LIQUIDITY_HISTORY;
  }
}
