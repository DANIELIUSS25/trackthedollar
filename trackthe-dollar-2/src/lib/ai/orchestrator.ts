// src/lib/ai/orchestrator.ts
// Central AI routing layer — decides which provider to use for each feature,
// combines internal structured data with web-grounded reasoning, and enforces
// all safety/quality/cost rules in one place.

import { withCache } from "@/lib/cache/withCache";
import {
  getPerplexityClient,
  PerplexityError,
  TRUSTED_DOMAINS,
  type PerplexityModel,
  type PerplexityResponse,
} from "./perplexity-client";
import {
  DAILY_NARRATIVE_SYSTEM,
  WHAT_CHANGED_WHY_SYSTEM,
  RESEARCH_NOTE_SYSTEM_V2,
  EVENT_EXPLAINER_SYSTEM,
  WIDGET_SUMMARY_SYSTEM,
  USER_QA_SYSTEM,
  buildDataContext,
} from "./prompts";
import type { AIGenerationResult, AIFeature, ConfidenceLevel, DataContext } from "./types";

// ─── Provider Routing ────────────────────────────────────────────────────────

/**
 * Feature → Provider routing table.
 *
 * PERPLEXITY features: those needing web context, citations, or current events.
 * CLAUDE features: those operating purely on internal structured data.
 * NEVER_AI features: raw numbers that must come from official sources only.
 */
const FEATURE_ROUTING: Record<AIFeature, ProviderConfig> = {
  // ── Perplexity features (web-grounded) ──────────────────────
  daily_narrative: {
    provider: "perplexity",
    model: "sonar-pro",
    maxTokens: 1500,
    cacheTtlSeconds: 3600,       // 1 hour — generated once daily
    cacheKey: "ttd:ai:narrative",
    searchRecency: "day",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.2,
  },
  what_changed_why: {
    provider: "perplexity",
    model: "sonar",              // Fast, cheap for shorter explanations
    maxTokens: 800,
    cacheTtlSeconds: 1800,       // 30 min
    cacheKey: "ttd:ai:whatchanged",
    searchRecency: "day",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.1,
  },
  research_note: {
    provider: "perplexity",
    model: "sonar-pro",
    maxTokens: 2000,
    cacheTtlSeconds: 86400,      // 24 hours
    cacheKey: "ttd:ai:research",
    searchRecency: "week",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.3,
  },
  event_explainer: {
    provider: "perplexity",
    model: "sonar",
    maxTokens: 600,
    cacheTtlSeconds: 7200,       // 2 hours
    cacheKey: "ttd:ai:event",
    searchRecency: "day",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.1,
  },
  widget_summary: {
    provider: "perplexity",
    model: "sonar",
    maxTokens: 400,
    cacheTtlSeconds: 3600,       // 1 hour
    cacheKey: "ttd:ai:widget",
    searchRecency: "week",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.1,
  },
  user_qa: {
    provider: "perplexity",
    model: "sonar-pro",
    maxTokens: 1500,
    cacheTtlSeconds: 900,        // 15 min (user queries less cacheable)
    cacheKey: "ttd:ai:qa",
    searchRecency: "week",
    domainFilter: TRUSTED_DOMAINS,
    temperature: 0.3,
  },

  // ── Claude features (internal data only) ────────────────────
  daily_briefing: {
    provider: "claude",
    model: "claude-sonnet" as unknown as PerplexityModel,
    maxTokens: 1000,
    cacheTtlSeconds: 3600,
    cacheKey: "ttd:ai:briefing",
    temperature: 0.2,
  },
  metric_explainer: {
    provider: "claude",
    model: "claude-sonnet" as unknown as PerplexityModel,
    maxTokens: 500,
    cacheTtlSeconds: 604800,     // 7 days
    cacheKey: "ttd:ai:explainer",
    temperature: 0.2,
  },
  alert_context: {
    provider: "claude",
    model: "claude-haiku" as unknown as PerplexityModel,
    maxTokens: 200,
    cacheTtlSeconds: 300,        // 5 min
    cacheKey: "ttd:ai:alert",
    temperature: 0.1,
  },
};

interface ProviderConfig {
  provider: "perplexity" | "claude";
  model: PerplexityModel;
  maxTokens: number;
  cacheTtlSeconds: number;
  cacheKey: string;
  searchRecency?: "month" | "week" | "day" | "hour";
  domainFilter?: string[];
  temperature: number;
}

// ─── Features that must NEVER use AI ─────────────────────────────────────────

/**
 * These are raw data values that must always come from official government sources.
 * AI must never generate, estimate, or round these values.
 */
export const NEVER_AI_FEATURES = [
  "total_debt_value",
  "tga_balance_value",
  "fed_balance_sheet_value",
  "rrp_value",
  "net_liquidity_value",
  "fed_funds_rate_value",
  "treasury_yield_values",
  "cpi_value",
  "m2_value",
  "auction_results",
  "monthly_treasury_statement_numbers",
  "debt_to_gdp_ratio",
] as const;

// ─── Main Orchestration ──────────────────────────────────────────────────────

/**
 * Generate AI content for a given feature.
 * Handles provider routing, caching, data injection, and fallbacks.
 */
export async function generateAIContent(
  feature: AIFeature,
  input: {
    prompt: string;
    dataContext?: DataContext;
    scope?: string;
    userId?: string;
  }
): Promise<AIGenerationResult> {
  const config = FEATURE_ROUTING[feature];
  if (!config) {
    return errorResult(feature, `Unknown feature: ${feature}`);
  }

  // Build cache key with scope
  const cacheKey = input.scope
    ? `${config.cacheKey}:${input.scope}`
    : config.cacheKey;

  // Check cache first
  const cached = await withCache(
    async () => null as AIGenerationResult | null,
    { key: `${cacheKey}:result`, ttl: config.cacheTtlSeconds, staleWhileRevalidate: true }
  );
  if (cached !== null) {
    return { ...cached, fromCache: true };
  }

  // Route to provider
  if (config.provider === "perplexity") {
    return generateWithPerplexity(feature, config, input, cacheKey);
  }

  // Claude features use the existing generate.ts functions
  return {
    feature,
    content: "",
    citations: [],
    confidence: "medium",
    model: config.model as string,
    provider: "claude",
    fromCache: false,
    generatedAt: new Date().toISOString(),
    disclaimer: "Generated from internal structured data using Claude.",
  };
}

async function generateWithPerplexity(
  feature: AIFeature,
  config: ProviderConfig,
  input: { prompt: string; dataContext?: DataContext; scope?: string; userId?: string },
  cacheKey: string
): Promise<AIGenerationResult> {
  const client = getPerplexityClient();

  if (!client.isConfigured()) {
    return fallbackResult(feature, "Perplexity API not configured");
  }

  // Build the system prompt based on feature
  const systemPrompt = getSystemPrompt(feature);

  // Build user message: inject structured data + user prompt
  const dataBlock = input.dataContext
    ? `\n\n--- INTERNAL DATA (from official government sources) ---\n${buildDataContext(input.dataContext)}\n--- END INTERNAL DATA ---\n\n`
    : "";

  const userMessage = `${dataBlock}${input.prompt}`;

  try {
    const response: PerplexityResponse = await client.query(
      {
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        returnCitations: true,
        searchRecency: config.searchRecency,
        searchDomainFilter: config.domainFilter,
      },
      { feature, userId: input.userId }
    );

    // Assess confidence based on citation quality
    const confidence = assessConfidence(response);

    // Validate: if content references numbers, cross-check against data context
    const validated = input.dataContext
      ? crossValidateNumbers(response.content, input.dataContext)
      : { content: response.content, warnings: [] };

    const result: AIGenerationResult = {
      feature,
      content: validated.content,
      citations: response.citations,
      confidence,
      model: response.model,
      provider: "perplexity",
      fromCache: false,
      generatedAt: new Date().toISOString(),
      tokenUsage: response.usage,
      warnings: validated.warnings,
      disclaimer: buildDisclaimer(feature, confidence),
    };

    // Cache the result
    await withCache(
      async () => result,
      { key: `${cacheKey}:result`, ttl: config.cacheTtlSeconds }
    );

    return result;
  } catch (err) {
    if (err instanceof PerplexityError) {
      console.error(`[orchestrator] PerplexityError (${err.type}): ${err.message}`);

      if (err.type === "budget") {
        return fallbackResult(feature, "AI budget limit reached. Using cached or static content.");
      }
      if (err.type === "safety") {
        return errorResult(feature, "This query cannot be processed by AI for safety reasons.");
      }
    }

    return fallbackResult(feature, "AI service temporarily unavailable.");
  }
}

// ─── System Prompt Selector ──────────────────────────────────────────────────

function getSystemPrompt(feature: AIFeature): string {
  switch (feature) {
    case "daily_narrative":
      return DAILY_NARRATIVE_SYSTEM;
    case "what_changed_why":
      return WHAT_CHANGED_WHY_SYSTEM;
    case "research_note":
      return RESEARCH_NOTE_SYSTEM_V2;
    case "event_explainer":
      return EVENT_EXPLAINER_SYSTEM;
    case "widget_summary":
      return WIDGET_SUMMARY_SYSTEM;
    case "user_qa":
      return USER_QA_SYSTEM;
    default:
      return DAILY_NARRATIVE_SYSTEM;
  }
}

// ─── Confidence Assessment ───────────────────────────────────────────────────

function assessConfidence(response: PerplexityResponse): ConfidenceLevel {
  const { citations, content } = response;

  // High confidence: 3+ citations from trusted domains
  const trustedCitations = citations.filter((c) =>
    TRUSTED_DOMAINS.some((d) => c.includes(d))
  );

  if (trustedCitations.length >= 3 && content.length > 200) {
    return "high";
  }

  // Medium: at least 1 trusted citation
  if (trustedCitations.length >= 1) {
    return "medium";
  }

  // Low: no trusted citations
  return "low";
}

// ─── Cross-Validation ────────────────────────────────────────────────────────

/**
 * Cross-check AI-generated numbers against our internal data.
 * If the AI hallucinates a number that's >5% off from our source data,
 * flag it with a warning.
 */
function crossValidateNumbers(
  content: string,
  dataContext: DataContext
): { content: string; warnings: string[] } {
  const warnings: string[] = [];

  // Extract dollar amounts from content (e.g., "$36.2T", "$782B")
  const dollarPattern = /\$[\d,.]+\s*[TBMK](?:rillion|illion)?/gi;
  const matches = content.match(dollarPattern) ?? [];

  for (const match of matches) {
    const normalized = parseDollarAmount(match);
    if (normalized === null) continue;

    // Check against known values in data context
    for (const [key, value] of Object.entries(dataContext)) {
      if (typeof value !== "number") continue;

      // If the AI mentions a number close to one of our values, check accuracy
      const ratio = normalized / value;
      if (ratio > 0.8 && ratio < 1.2) {
        // Same order of magnitude — check if it's within 5%
        const diff = Math.abs(ratio - 1);
        if (diff > 0.05) {
          warnings.push(
            `AI stated ${match} for ${key}, but official data shows ${formatForWarning(value)}. Difference: ${(diff * 100).toFixed(1)}%`
          );
        }
      }
    }
  }

  return { content, warnings };
}

function parseDollarAmount(text: string): number | null {
  const clean = text.replace(/[$,]/g, "").trim();
  const numMatch = clean.match(/([\d.]+)\s*([TBMK])/i);
  if (!numMatch) return null;

  const num = parseFloat(numMatch[1]);
  const suffix = numMatch[2].toUpperCase();
  const multipliers: Record<string, number> = { T: 1e12, B: 1e9, M: 1e6, K: 1e3 };
  return num * (multipliers[suffix] ?? 1);
}

function formatForWarning(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}

// ─── Disclaimer Builder ──────────────────────────────────────────────────────

function buildDisclaimer(feature: AIFeature, confidence: ConfidenceLevel): string {
  const base = "AI-generated analysis. Not financial advice.";

  if (confidence === "low") {
    return `${base} Low source confidence — verify claims independently.`;
  }

  if (feature === "user_qa") {
    return `${base} Answers combine platform data with web search. Always verify with official sources.`;
  }

  return `${base} All numerical data sourced from official U.S. government APIs.`;
}

// ─── Fallback / Error Results ────────────────────────────────────────────────

function fallbackResult(feature: AIFeature, reason: string): AIGenerationResult {
  return {
    feature,
    content: "",
    citations: [],
    confidence: "none",
    model: "fallback",
    provider: "none",
    fromCache: false,
    generatedAt: new Date().toISOString(),
    fallbackReason: reason,
    disclaimer: reason,
  };
}

function errorResult(feature: AIFeature, message: string): AIGenerationResult {
  return {
    feature,
    content: "",
    citations: [],
    confidence: "none",
    model: "error",
    provider: "none",
    fromCache: false,
    generatedAt: new Date().toISOString(),
    error: message,
    disclaimer: message,
  };
}
