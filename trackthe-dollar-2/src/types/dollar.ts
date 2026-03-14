// src/types/dollar.ts
// Core types for the U.S. dollar ecosystem tracking platform

// ─── Time Series ────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface TimeSeriesData {
  id: string;
  label: string;
  units: string;
  source: DataSource;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  lastUpdated: string;
  series: TimeSeriesPoint[];
}

export type DataSource =
  | "fred"
  | "treasury_fiscal_data"
  | "treasury_direct"
  | "cbo"
  | "usa_spending"
  | "calculated";

// ─── National Debt ──────────────────────────────────────────────────────────

export interface DebtSnapshot {
  totalPublicDebt: number; // Total public debt outstanding
  debtHeldByPublic: number; // Marketable debt held by public
  intragovernmental: number; // Intragovernmental holdings (trust funds)
  marketable: number; // Marketable securities total
  nonMarketable: number; // Non-marketable securities
  date: string;
}

export interface DebtComposition {
  bills: number; // T-Bills (< 1yr)
  notes: number; // T-Notes (2-10yr)
  bonds: number; // T-Bonds (20-30yr)
  tips: number; // Treasury Inflation-Protected
  frn: number; // Floating Rate Notes
  date: string;
}

export interface DebtMetrics {
  current: DebtSnapshot;
  debtToGdp: number;
  dailyChange: number;
  monthlyChange: number;
  yearlyChange: number;
  projectedYearEnd: number;
  averageDailyIncrease30d: number;
  composition: DebtComposition;
  history: TimeSeriesPoint[];
}

// ─── Treasury & Borrowing ───────────────────────────────────────────────────

export interface TreasuryAuction {
  securityType: "Bill" | "Note" | "Bond" | "TIPS" | "FRN";
  securityTerm: string; // e.g., "13-Week", "10-Year"
  auctionDate: string;
  issueDate: string;
  maturityDate: string;
  offeringAmount: number;
  highYield: number | null;
  bidToCover: number | null;
  allocationPctIndirect: number | null;
  allocationPctDirect: number | null;
  allocationPctPrimary: number | null;
  status: "upcoming" | "completed" | "announced";
}

export interface BorrowingEstimate {
  quarter: string; // e.g., "2026-Q1"
  estimatedBorrowing: number;
  actualBorrowing: number | null;
  netMarketable: number;
  endOfQuarterCashBalance: number;
}

// ─── Liquidity ──────────────────────────────────────────────────────────────

export interface LiquiditySnapshot {
  fedBalanceSheet: number; // WALCL — Fed total assets
  tga: number; // Treasury General Account balance
  rrp: number; // Reverse Repo Facility balance
  netLiquidity: number; // Fed BS - TGA - RRP
  bankReserves: number | null; // Reserve balances
  date: string;
}

export interface LiquidityMetrics {
  current: LiquiditySnapshot;
  netLiquidityChange30d: number;
  fedBsChange30d: number;
  tgaChange30d: number;
  rrpChange30d: number;
  netLiquidityHistory: TimeSeriesPoint[];
  fedBsHistory: TimeSeriesPoint[];
  tgaHistory: TimeSeriesPoint[];
  rrpHistory: TimeSeriesPoint[];
}

// ─── Fiscal Flows ───────────────────────────────────────────────────────────

export interface FiscalSnapshot {
  totalReceipts: number;
  totalOutlays: number;
  surplus_deficit: number; // Positive = surplus, negative = deficit
  period: string; // e.g., "2026-02" or "2026-FY"
  periodType: "monthly" | "fiscal_year_to_date" | "fiscal_year";
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentOfTotal: number;
  priorYearAmount: number | null;
  yoyChange: number | null;
}

export interface RevenueSource {
  source: string;
  amount: number;
  percentOfTotal: number;
  priorYearAmount: number | null;
  yoyChange: number | null;
}

export interface FiscalMetrics {
  currentMonth: FiscalSnapshot;
  fiscalYTD: FiscalSnapshot;
  priorFiscalYTD: FiscalSnapshot | null;
  spendingByCategory: SpendingCategory[];
  revenueBySource: RevenueSource[];
  interestExpense: number;
  interestExpenseHistory: TimeSeriesPoint[];
  deficitHistory: TimeSeriesPoint[];
  receiptHistory: TimeSeriesPoint[];
  outlayHistory: TimeSeriesPoint[];
}

// ─── Dollar & Global ────────────────────────────────────────────────────────

export interface DollarMetrics {
  dxy: number;
  dxyChange: number;
  dxyChangePercent: number;
  dxySeries: TimeSeriesPoint[];
}

// ─── Dashboard Overview ─────────────────────────────────────────────────────

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  change: number | null;
  changePercent: number | null;
  changeDirection: "positive" | "negative" | "neutral";
  invertColor?: boolean; // e.g., debt increase = negative sentiment
  unit: string;
  sparkline: TimeSeriesPoint[];
  source: DataSource;
  lastUpdated: string;
  href: string; // Link to detail page
}

export interface DashboardData {
  metrics: DashboardMetric[];
  alerts: DashboardAlert[];
  lastRefreshed: string;
}

export interface DashboardAlert {
  id: string;
  type: "info" | "warning" | "critical";
  title: string;
  message: string;
  metric: string;
  timestamp: string;
}

// ─── FRED Additional Series ─────────────────────────────────────────────────

export type DollarIndicatorId =
  // Existing FRED
  | "FEDFUNDS"
  | "CPIAUCSL"
  | "UNRATE"
  | "GDP"
  | "T10YIE"
  | "DGS10"
  | "DGS2"
  | "T10Y2Y"
  | "WALCL"
  | "M2SL"
  // New dollar-system FRED series
  | "GFDEBTN"     // Federal Debt: Total Public Debt
  | "GFDEGDQ188S" // Federal Debt to GDP Ratio
  | "RRPONTSYD"   // Overnight Reverse Repo
  | "WTREGEN"     // Treasury General Account (TGA)
  | "WRESBAL"     // Reserve Balances with Fed
  | "FDHBFIN"     // Federal Debt Held by Federal Reserve
  | "FDHBFRBN"    // Federal Debt Held by Foreign Investors
  | "A091RC1Q027SBEA" // Federal Interest Payments
  | "MTSDS133FMS" // Federal Surplus or Deficit
  | "W006RC1Q027SBEA" // Federal Receipts
  | "DTWEXBGS";   // Trade-Weighted Dollar Index
