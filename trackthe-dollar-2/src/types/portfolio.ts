// src/types/portfolio.ts

export interface Holding {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCostBasis: number; // per share/unit in USD
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HoldingWithValue extends Holding {
  currentPrice: number;
  marketValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  holdings: Holding[];
}

export interface PortfolioWithMetrics extends Portfolio {
  holdings: HoldingWithValue[];
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface AddHoldingInput {
  symbol: string;
  quantity: number;
  avgCostBasis: number;
  notes?: string;
}

export interface UpdateHoldingInput {
  quantity?: number;
  avgCostBasis?: number;
  notes?: string;
}
