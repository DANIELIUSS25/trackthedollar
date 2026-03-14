// src/lib/ai/generate.ts
import { prisma } from "@/lib/db/client";
import { redisDel } from "@/lib/redis/client";
import {
  DAILY_BRIEFING_SYSTEM,
  METRIC_EXPLAINER_SYSTEM,
  ALERT_CONTEXT_SYSTEM,
  RESEARCH_NOTE_SYSTEM,
} from "./prompts";

interface BriefingContext {
  date: string;
  totalDebt: number | null;
  debtChange: number | null;
  tgaBalance: number | null;
  fedBalanceSheet: number | null;
  rrpBalance: number | null;
  netLiquidity: number | null;
  fedFundsRate: number | null;
  dgs10: number | null;
  dgs2: number | null;
  yieldCurve: number | null;
  m2: number | null;
  cpi: number | null;
}

/**
 * Generate the daily intelligence briefing using Claude API.
 */
export async function generateDailyBriefing(): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[ai] ANTHROPIC_API_KEY not set, skipping briefing generation");
    return "";
  }

  // Gather latest data
  const [latest, prior] = await Promise.all([
    prisma.dailySnapshot.findFirst({ orderBy: { date: "desc" } }),
    prisma.dailySnapshot.findFirst({ orderBy: { date: "desc" }, skip: 1 }),
  ]);

  if (!latest) {
    console.warn("[ai] No daily snapshot available for briefing");
    return "";
  }

  const context: BriefingContext = {
    date: latest.date.toISOString().split("T")[0],
    totalDebt: latest.totalDebt?.toNumber() ?? null,
    debtChange: latest.totalDebt && prior?.totalDebt
      ? latest.totalDebt.toNumber() - prior.totalDebt.toNumber()
      : null,
    tgaBalance: latest.tgaBalance?.toNumber() ?? null,
    fedBalanceSheet: latest.fedBalanceSheet?.toNumber() ?? null,
    rrpBalance: latest.rrpBalance?.toNumber() ?? null,
    netLiquidity: latest.netLiquidity?.toNumber() ?? null,
    fedFundsRate: latest.fedFundsRate?.toNumber() ?? null,
    dgs10: latest.dgs10?.toNumber() ?? null,
    dgs2: latest.dgs2?.toNumber() ?? null,
    yieldCurve: latest.yieldCurve?.toNumber() ?? null,
    m2: latest.m2?.toNumber() ?? null,
    cpi: latest.cpi?.toNumber() ?? null,
  };

  // Call Claude API
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: DAILY_BRIEFING_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Generate today's macro intelligence briefing based on the following data:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text ?? "";

  // Store in database
  const startOfDay = new Date(context.date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(context.date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  await prisma.aISummary.create({
    data: {
      type: "daily_briefing",
      scope: "dashboard",
      title: `Daily Intelligence Summary — ${context.date}`,
      content,
      dataSources: context as unknown as Record<string, unknown>,
      model: "claude-sonnet-4-20250514",
      confidence: 0.85,
      validFrom: startOfDay,
      validUntil: endOfDay,
      publishedAt: new Date(),
    },
  });

  // Invalidate cached briefing
  await redisDel("ttd:ai:briefing:dashboard:latest");

  console.info(`[ai] Daily briefing generated for ${context.date} (${content.length} chars)`);
  return content;
}

/**
 * Generate a metric explainer using Claude API.
 */
export async function generateMetricExplainer(
  metricName: string,
  currentValue: number,
  units: string,
  historicalContext: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: METRIC_EXPLAINER_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Write an explainer for: ${metricName}\nCurrent value: ${currentValue} ${units}\nHistorical context: ${historicalContext}`,
        },
      ],
    }),
  });

  if (!response.ok) return "";

  const result = await response.json();
  return result.content?.[0]?.text ?? "";
}

/**
 * Generate alert context using Claude API (fast, cheap).
 */
export async function generateAlertContext(
  alertName: string,
  seriesId: string,
  currentValue: number,
  targetValue: number,
  condition: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: ALERT_CONTEXT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Alert "${alertName}" triggered: ${seriesId} is ${currentValue} (condition: ${condition} ${targetValue})`,
        },
      ],
    }),
  });

  if (!response.ok) return "";

  const result = await response.json();
  return result.content?.[0]?.text ?? "";
}

/**
 * Generate a research note using Perplexity API for web-sourced synthesis.
 */
export async function generateResearchNote(topic: string): Promise<{
  content: string;
  citations: string[];
}> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return { content: "", citations: [] };

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: RESEARCH_NOTE_SYSTEM,
        },
        {
          role: "user",
          content: topic,
        },
      ],
      max_tokens: 2000,
      return_citations: true,
    }),
  });

  if (!response.ok) return { content: "", citations: [] };

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content ?? "";
  const citations = result.citations ?? [];

  // Store in database
  await prisma.aISummary.create({
    data: {
      type: "research_note",
      scope: "market",
      title: `Research: ${topic.slice(0, 100)}`,
      content,
      dataSources: { topic, citations },
      model: "sonar-pro",
      confidence: 0.75,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      publishedAt: new Date(),
    },
  });

  return { content, citations };
}
