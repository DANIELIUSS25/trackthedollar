// src/lib/ai/perplexity-client.ts
// Low-level Perplexity API client with retries, cost tracking, and safety rails.

import { redisGet, redisSet } from "@/lib/redis/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexityRequestOptions {
  model: PerplexityModel;
  messages: PerplexityMessage[];
  maxTokens?: number;
  temperature?: number;
  returnCitations?: boolean;
  searchRecency?: "month" | "week" | "day" | "hour" | undefined;
  searchDomainFilter?: string[] | undefined;
}

export interface PerplexityResponse {
  content: string;
  citations: string[];
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface PerplexityCostRecord {
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  feature: string;
  timestamp: string;
}

// ─── Model Configuration ─────────────────────────────────────────────────────

export type PerplexityModel = "sonar" | "sonar-pro" | "sonar-reasoning-pro";

/**
 * Cost per 1M tokens (USD). Updated for Perplexity's current pricing.
 * sonar:              $1/M input,  $1/M output  (fast, cheap)
 * sonar-pro:          $3/M input,  $15/M output (quality, citations)
 * sonar-reasoning-pro: $2/M input, $8/M output  (reasoning, expensive)
 */
const MODEL_COSTS: Record<PerplexityModel, { input: number; output: number }> = {
  "sonar":               { input: 1,  output: 1 },
  "sonar-pro":           { input: 3,  output: 15 },
  "sonar-reasoning-pro": { input: 2,  output: 8 },
};

/** Maximum tokens per request by model — hard safety limit */
const MAX_TOKENS_LIMIT: Record<PerplexityModel, number> = {
  "sonar": 2000,
  "sonar-pro": 4000,
  "sonar-reasoning-pro": 4000,
};

// ─── Cost Tracking ───────────────────────────────────────────────────────────

const DAILY_BUDGET_KEY = "ttd:ai:perplexity:daily_cost";
const DAILY_BUDGET_USD = parseFloat(process.env.PERPLEXITY_DAILY_BUDGET_USD ?? "10");
const MONTHLY_BUDGET_KEY = "ttd:ai:perplexity:monthly_cost";
const MONTHLY_BUDGET_USD = parseFloat(process.env.PERPLEXITY_MONTHLY_BUDGET_USD ?? "200");

function estimateCost(
  model: PerplexityModel,
  promptTokens: number,
  completionTokens: number
): number {
  const rates = MODEL_COSTS[model];
  return (promptTokens * rates.input + completionTokens * rates.output) / 1_000_000;
}

async function checkBudget(): Promise<{ allowed: boolean; dailySpent: number; monthlySpent: number }> {
  const [daily, monthly] = await Promise.all([
    redisGet<number>(DAILY_BUDGET_KEY),
    redisGet<number>(MONTHLY_BUDGET_KEY),
  ]);
  const dailySpent = daily ?? 0;
  const monthlySpent = monthly ?? 0;

  return {
    allowed: dailySpent < DAILY_BUDGET_USD && monthlySpent < MONTHLY_BUDGET_USD,
    dailySpent,
    monthlySpent,
  };
}

async function recordCost(cost: number): Promise<void> {
  const [currentDaily, currentMonthly] = await Promise.all([
    redisGet<number>(DAILY_BUDGET_KEY),
    redisGet<number>(MONTHLY_BUDGET_KEY),
  ]);

  const now = new Date();
  const secondsUntilMidnight = (24 - now.getUTCHours()) * 3600 - now.getUTCMinutes() * 60;
  const daysInMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate();
  const secondsUntilMonthEnd = (daysInMonth - now.getUTCDate()) * 86400 + secondsUntilMidnight;

  await Promise.all([
    redisSet(DAILY_BUDGET_KEY, (currentDaily ?? 0) + cost, Math.max(secondsUntilMidnight, 60)),
    redisSet(MONTHLY_BUDGET_KEY, (currentMonthly ?? 0) + cost, Math.max(secondsUntilMonthEnd, 60)),
  ]);
}

// ─── Content Safety ──────────────────────────────────────────────────────────

/** Topics Perplexity must NEVER be used for */
const BLOCKED_TOPICS = [
  "buy", "sell", "invest", "trade", "should i",
  "financial advice", "stock pick", "portfolio recommendation",
  "predict", "will the market", "price target",
];

function containsBlockedTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_TOPICS.some((topic) => lower.includes(topic));
}

/** Post-generation content filter: strip any financial advice that leaks through */
function sanitizeOutput(content: string): string {
  const advicePatterns = [
    /\b(you should|we recommend|consider (buying|selling)|I suggest)\b/gi,
    /\b(this is (not |)financial advice)\b/gi,
    /\b(NFA|DYOR)\b/g,
  ];

  let sanitized = content;
  for (const pattern of advicePatterns) {
    sanitized = sanitized.replace(pattern, "[removed]");
  }

  return sanitized;
}

// ─── Domain Filters ──────────────────────────────────────────────────────────

/** Trusted domains for fiscal/monetary searches */
export const TRUSTED_DOMAINS = [
  "treasury.gov",
  "fiscal.treasury.gov",
  "federalreserve.gov",
  "fred.stlouisfed.org",
  "cbo.gov",
  "bls.gov",
  "bea.gov",
  "usaspending.gov",
  "reuters.com",
  "bloomberg.com",
  "wsj.com",
  "ft.com",
  "cnbc.com",
  "federalreserve.gov",
  "newyorkfed.org",
];

// ─── Client ──────────────────────────────────────────────────────────────────

export class PerplexityClient {
  private apiKey: string;
  private baseUrl = "https://api.perplexity.ai/chat/completions";

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.PERPLEXITY_API_KEY ?? "";
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Make a Perplexity API call with retries, budget checks, and safety rails.
   */
  async query(
    options: PerplexityRequestOptions,
    context: { feature: string; userId?: string | undefined }
  ): Promise<PerplexityResponse> {
    if (!this.isConfigured()) {
      throw new PerplexityError("PERPLEXITY_API_KEY not configured", "config");
    }

    // Budget check
    const budget = await checkBudget();
    if (!budget.allowed) {
      throw new PerplexityError(
        `Budget exceeded: daily=$${budget.dailySpent.toFixed(2)}/${DAILY_BUDGET_USD}, monthly=$${budget.monthlySpent.toFixed(2)}/${MONTHLY_BUDGET_USD}`,
        "budget"
      );
    }

    // Content safety: check input
    const userMessage = options.messages.find((m) => m.role === "user")?.content ?? "";
    if (containsBlockedTopic(userMessage)) {
      throw new PerplexityError("Query contains blocked topic (financial advice)", "safety");
    }

    // Enforce max tokens limit
    const maxTokens = Math.min(
      options.maxTokens ?? MAX_TOKENS_LIMIT[options.model],
      MAX_TOKENS_LIMIT[options.model]
    );

    // Build request body
    const body: Record<string, unknown> = {
      model: options.model,
      messages: options.messages,
      max_tokens: maxTokens,
      temperature: options.temperature ?? 0.2,
      return_citations: options.returnCitations ?? true,
    };

    if (options.searchRecency) {
      body.search_recency_filter = options.searchRecency;
    }
    if (options.searchDomainFilter && options.searchDomainFilter.length > 0) {
      body.search_domain_filter = options.searchDomainFilter;
    }

    // Retry loop (2 retries max)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30_000),
        });

        if (response.status === 429) {
          // Rate limited — backoff and retry
          const retryAfter = parseInt(response.headers.get("retry-after") ?? "5");
          await sleep(retryAfter * 1000);
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new PerplexityError(
            `API error ${response.status}: ${errText.slice(0, 200)}`,
            "api"
          );
        }

        const result = await response.json();
        const choice = result.choices?.[0];
        const content = choice?.message?.content ?? "";
        const citations: string[] = result.citations ?? [];

        const usage = {
          promptTokens: result.usage?.prompt_tokens ?? 0,
          completionTokens: result.usage?.completion_tokens ?? 0,
          totalTokens: result.usage?.total_tokens ?? 0,
        };

        // Record cost
        const cost = estimateCost(options.model, usage.promptTokens, usage.completionTokens);
        await recordCost(cost);

        // Log cost for monitoring
        console.info(
          `[perplexity] ${context.feature} | model=${options.model} | tokens=${usage.totalTokens} | cost=$${cost.toFixed(4)}`
        );

        // Sanitize output
        const sanitizedContent = sanitizeOutput(content);

        return {
          content: sanitizedContent,
          citations,
          model: options.model,
          usage,
          finishReason: choice?.finish_reason ?? "stop",
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof PerplexityError && err.type !== "api") throw err;
        if (attempt < 2) await sleep(1000 * (attempt + 1));
      }
    }

    throw lastError ?? new PerplexityError("Unknown error after retries", "api");
  }
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class PerplexityError extends Error {
  constructor(
    message: string,
    public readonly type: "config" | "budget" | "safety" | "api" | "validation"
  ) {
    super(message);
    this.name = "PerplexityError";
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let _client: PerplexityClient | null = null;

export function getPerplexityClient(): PerplexityClient {
  if (!_client) _client = new PerplexityClient();
  return _client;
}
