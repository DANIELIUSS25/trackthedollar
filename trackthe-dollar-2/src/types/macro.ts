// src/types/macro.ts

export type MacroIndicatorId =
  | "FEDFUNDS"      // Fed Funds Rate
  | "CPIAUCSL"      // CPI All Items
  | "UNRATE"        // Unemployment Rate
  | "GDP"           // Real GDP
  | "T10YIE"        // 10Y Breakeven Inflation
  | "DGS10"         // 10Y Treasury Yield
  | "DGS2"          // 2Y Treasury Yield
  | "T10Y2Y"        // Yield Curve Spread
  | "WALCL"         // Fed Balance Sheet
  | "M2SL";         // M2 Money Supply

export interface MacroDataPoint {
  date: string; // YYYY-MM-DD
  value: number | null;
}

export interface MacroIndicator {
  id: MacroIndicatorId;
  title: string;
  description: string;
  units: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  latestValue: number | null;
  latestDate: string | null;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  series: MacroDataPoint[];
  updatedAt: string;
}

export interface FedMeeting {
  date: string;
  decision: "hike" | "cut" | "hold" | "unknown";
  rateBefore: number;
  rateAfter: number;
  bps: number;
  statementUrl: string | null;
}
