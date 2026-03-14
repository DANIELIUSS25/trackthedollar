// src/lib/ai/types.ts
// Shared types for the AI intelligence layer.

// ─── Feature Types ───────────────────────────────────────────────────────────

/** All AI features in the system */
export type AIFeature =
  // Perplexity-powered (web-grounded)
  | "daily_narrative"
  | "what_changed_why"
  | "research_note"
  | "event_explainer"
  | "widget_summary"
  | "user_qa"
  // Claude-powered (internal data)
  | "daily_briefing"
  | "metric_explainer"
  | "alert_context";

/** Confidence level for AI-generated content */
export type ConfidenceLevel = "high" | "medium" | "low" | "none";

// ─── Data Context ────────────────────────────────────────────────────────────

/**
 * Structured data from official sources that gets injected into AI prompts.
 * This is the "ground truth" that AI uses for context — it must never
 * generate these values itself.
 */
export interface DataContext {
  // National Debt
  totalDebt?: number;
  debtChange?: number;
  debtToGdp?: number;

  // Liquidity
  fedBalanceSheet?: number;
  tgaBalance?: number;
  rrpBalance?: number;
  netLiquidity?: number;

  // Rates & Yields
  fedFundsRate?: number;
  dgs10?: number;
  dgs2?: number;
  yieldCurveSpread?: number;

  // Money & Inflation
  m2?: number;
  cpi?: number;

  // Fiscal
  fiscalYtdReceipts?: number;
  fiscalYtdOutlays?: number;
  fiscalYtdDeficit?: number;
  interestExpense?: number;

  // Metadata
  date?: string;
  priorDate?: string;

  // Custom key-value pairs for specific features
  [key: string]: number | string | undefined;
}

// ─── Generation Results ──────────────────────────────────────────────────────

export interface AIGenerationResult {
  feature: AIFeature;
  content: string;
  citations: string[];
  confidence: ConfidenceLevel;
  model: string;
  provider: "perplexity" | "claude" | "none";
  fromCache: boolean;
  generatedAt: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  warnings?: string[];
  fallbackReason?: string;
  error?: string;
  disclaimer: string;
}

// ─── Evaluation Types ────────────────────────────────────────────────────────

export interface EvalCriterion {
  name: string;
  description: string;
  weight: number; // 0-1
}

export interface EvalResult {
  feature: AIFeature;
  score: number; // 0-100
  criteria: Array<{
    criterion: string;
    pass: boolean;
    notes: string;
  }>;
  timestamp: string;
}

// ─── Citation Types ──────────────────────────────────────────────────────────

export interface ParsedCitation {
  url: string;
  domain: string;
  isTrusted: boolean;
  title?: string;
}

// ─── Cost Types ──────────────────────────────────────────────────────────────

export interface CostSummary {
  dailySpentUsd: number;
  dailyBudgetUsd: number;
  monthlySpentUsd: number;
  monthlyBudgetUsd: number;
  requestCount: number;
  avgCostPerRequest: number;
}
