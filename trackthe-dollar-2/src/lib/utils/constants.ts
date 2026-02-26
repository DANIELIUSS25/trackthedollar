// src/lib/utils/constants.ts

export const APP_NAME = "TrackTheDollar";
export const APP_DESCRIPTION =
  "Professional-grade financial dashboard. Real-time market data, macro indicators, and portfolio analytics.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Navigation
export const DASHBOARD_ROUTES = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Markets", href: "/markets", icon: "TrendingUp" },
  { label: "Macro", href: "/macro", icon: "Globe" },
  { label: "Portfolio", href: "/portfolio", icon: "PieChart" },
  { label: "Alerts", href: "/alerts", icon: "Bell" },
] as const;

// Tier limits — mirrors lib/auth/permissions.ts for client-side gating
export const TIER_LIMITS = {
  USER: {
    maxAlerts: 3,
    maxWatchlistItems: 10,
    maxPortfolios: 1,
    refreshIntervalMs: 60_000,
  },
  PRO: {
    maxAlerts: 50,
    maxWatchlistItems: 200,
    maxPortfolios: 10,
    refreshIntervalMs: 15_000,
  },
  ENTERPRISE: {
    maxAlerts: 500,
    maxWatchlistItems: 2000,
    maxPortfolios: 100,
    refreshIntervalMs: 5_000,
  },
  ADMIN: {
    maxAlerts: Infinity,
    maxWatchlistItems: Infinity,
    maxPortfolios: Infinity,
    refreshIntervalMs: 5_000,
  },
} as const;

// Time range labels
export const TIME_RANGE_LABELS = {
  "1D": "1 Day",
  "5D": "5 Days",
  "1M": "1 Month",
  "3M": "3 Months",
  "6M": "6 Months",
  "1Y": "1 Year",
  "5Y": "5 Years",
} as const;

// Cache keys — keep centralized to avoid typos
export const CACHE_KEYS = {
  quote: (symbol: string) => `quote:${symbol.toUpperCase()}`,
  history: (symbol: string, range: string) =>
    `history:${symbol.toUpperCase()}:${range}`,
  search: (q: string) => `search:${q.toLowerCase().trim()}`,
  movers: () => `movers:latest`,
  macroIndicator: (id: string) => `macro:${id}`,
  fedMeetings: () => `macro:fed_meetings`,
} as const;

// Watchlist default symbols
export const DEFAULT_WATCHLIST = [
  "SPY",
  "QQQ",
  "AAPL",
  "MSFT",
  "NVDA",
  "BTC-USD",
  "ETH-USD",
  "DXY",
] as const;

// API error codes
export const API_ERRORS = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
} as const;
