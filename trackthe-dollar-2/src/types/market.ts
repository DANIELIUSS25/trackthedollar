// src/types/market.ts

export type AssetClass = "stock" | "etf" | "crypto" | "forex" | "index";

export type TimeRange = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y";

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  pe: number | null;
  week52High: number;
  week52Low: number;
  assetClass: AssetClass;
  exchange: string;
  currency: string;
  updatedAt: string; // ISO 8601
}

export interface OHLCVBar {
  timestamp: number; // Unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  range: TimeRange;
  bars: OHLCVBar[];
}

export interface Mover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  assetClass: AssetClass;
}

export interface MarketMovers {
  gainers: Mover[];
  losers: Mover[];
  mostActive: Mover[];
  updatedAt: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  assetClass: AssetClass;
  currency: string;
}

export interface TickerItem {
  symbol: string;
  price: number;
  changePercent: number;
}
