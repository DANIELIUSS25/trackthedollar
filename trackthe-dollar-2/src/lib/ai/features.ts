// src/lib/ai/features.ts
// High-level feature functions that use the orchestrator to generate AI content.
// Each function gathers the right data context and delegates to generateAIContent().

import { generateAIContent } from "./orchestrator";
import type { AIGenerationResult, DataContext } from "./types";

// ─── Daily Narrative Summary ─────────────────────────────────────────────────

/**
 * Generate a daily narrative summary combining internal data with web context.
 * Used for the main dashboard "Intelligence Summary" card.
 *
 * Schedule: Daily at 7:15 AM UTC (after data ingestion at 7:00 AM)
 * Provider: Perplexity (sonar-pro) for web-grounded context
 * Fallback: Returns empty result; UI shows "Summary unavailable" with raw data
 */
export async function generateDailyNarrative(
  dataContext: DataContext
): Promise<AIGenerationResult> {
  const date = dataContext.date ?? new Date().toISOString().split("T")[0];

  return generateAIContent("daily_narrative", {
    prompt: `Generate today's macro intelligence narrative for ${date}. Focus on the most significant developments in the U.S. dollar system: national debt movements, liquidity changes, rate movements, and any notable fiscal events. Explain what happened and why it matters.`,
    dataContext,
    scope: `dashboard:${date}`,
  });
}

// ─── What Changed and Why ────────────────────────────────────────────────────

/**
 * Generate explanations for daily metric changes.
 * Powers the "What Changed Today" section with WHY context.
 *
 * Schedule: Triggered after daily snapshot builder runs
 * Provider: Perplexity (sonar) for fast, cheap explanations
 * Fallback: Shows raw changes without explanation
 */
export async function generateWhatChangedWhy(
  changes: Array<{
    metric: string;
    direction: "up" | "down";
    amount: string;
    value: string;
  }>,
  dataContext: DataContext
): Promise<AIGenerationResult> {
  const changeList = changes
    .map((c) => `- ${c.metric}: ${c.direction === "up" ? "+" : ""}${c.amount} (now ${c.value})`)
    .join("\n");

  return generateAIContent("what_changed_why", {
    prompt: `Explain why each of these metrics changed today:\n\n${changeList}\n\nFor each one, search for relevant news or policy context from the past 24 hours.`,
    dataContext,
    scope: `whatchanged:${dataContext.date ?? "today"}`,
  });
}

// ─── Research Note ───────────────────────────────────────────────────────────

/**
 * Generate a deep-dive research note on a specific topic.
 * Powers the "Research & Analysis" section.
 *
 * Schedule: On-demand or weekly batch for curated topics
 * Provider: Perplexity (sonar-pro) for thorough web research
 * Fallback: Returns empty; UI hides card or shows "Research pending"
 */
export async function generateResearchNote(
  topic: string,
  dataContext?: DataContext
): Promise<AIGenerationResult> {
  return generateAIContent("research_note", {
    prompt: topic,
    ...(dataContext !== undefined ? { dataContext } : {}),
    scope: `research:${slugify(topic)}`,
  });
}

// ─── Event Explainer ─────────────────────────────────────────────────────────

/**
 * Explain a specific fiscal/monetary event in context.
 * Powers event feed cards with contextual "why it matters" explanations.
 *
 * Schedule: Triggered when new events are detected (auction results, data releases)
 * Provider: Perplexity (sonar) for fast event context
 * Fallback: Shows event without explanation
 */
export async function generateEventExplainer(
  event: {
    title: string;
    type: "auction" | "data_release" | "policy" | "fiscal";
    detail?: string;
  },
  dataContext?: DataContext
): Promise<AIGenerationResult> {
  const prompt = event.detail
    ? `Explain this event and its implications for the U.S. dollar system:\n\nEvent: ${event.title}\nType: ${event.type}\nDetails: ${event.detail}`
    : `Explain this event and its implications for the U.S. dollar system:\n\nEvent: ${event.title}\nType: ${event.type}`;

  return generateAIContent("event_explainer", {
    prompt,
    ...(dataContext !== undefined ? { dataContext } : {}),
    scope: `event:${slugify(event.title)}`,
  });
}

// ─── Widget Summary ──────────────────────────────────────────────────────────

/**
 * Generate a brief contextual summary for a dashboard widget.
 * Powers metric card tooltips and chart context panels.
 *
 * Schedule: On-demand, triggered by widget render (cached aggressively)
 * Provider: Perplexity (sonar) for minimal, fast context
 * Fallback: Widget shows without summary text
 */
export async function generateWidgetSummary(
  metricId: string,
  metricLabel: string,
  currentValue: string,
  dataContext?: DataContext
): Promise<AIGenerationResult> {
  return generateAIContent("widget_summary", {
    prompt: `Write a brief contextual summary for the "${metricLabel}" widget. Current value: ${currentValue}. What's the recent trend and why is this level significant?`,
    ...(dataContext !== undefined ? { dataContext } : {}),
    scope: `widget:${metricId}`,
  });
}

// ─── User Q&A ────────────────────────────────────────────────────────────────

/**
 * Answer a user's question about the dollar system.
 * Powers the search/ask feature and future chat interface.
 *
 * Schedule: On-demand (user-triggered)
 * Provider: Perplexity (sonar-pro) for comprehensive answers
 * Fallback: Returns "Unable to answer right now. Please try again later."
 * Rate limit: PRO+ only, max 20 queries/day per user
 */
export async function answerUserQuestion(
  question: string,
  dataContext: DataContext,
  userId: string
): Promise<AIGenerationResult> {
  return generateAIContent("user_qa", {
    prompt: question,
    dataContext,
    scope: `qa:${userId}:${Date.now()}`,
    userId,
  });
}

// ─── Batch: Curated Research Topics ──────────────────────────────────────────

/**
 * Default topics for weekly automated research note generation.
 */
export const CURATED_RESEARCH_TOPICS = [
  "Latest U.S. Treasury auction results and demand trends this week",
  "Federal Reserve balance sheet changes and QT impact this week",
  "U.S. fiscal deficit trajectory and latest CBO projections update",
  "Treasury General Account (TGA) movements and their liquidity implications",
  "U.S. national debt composition changes and refinancing schedule",
  "Federal interest expense growth and comparison to other budget categories",
  "Reverse repo facility balance changes and money market fund behavior",
  "Yield curve dynamics and recession signal implications",
];

/**
 * Generate all curated research notes in batch.
 * Designed to run weekly on Monday mornings.
 */
export async function generateBatchResearchNotes(
  dataContext: DataContext
): Promise<AIGenerationResult[]> {
  const results: AIGenerationResult[] = [];

  // Sequential to respect rate limits and budgets
  for (const topic of CURATED_RESEARCH_TOPICS) {
    const result = await generateResearchNote(topic, dataContext);
    results.push(result);

    // If budget is exhausted, stop early
    if (result.fallbackReason?.includes("budget")) {
      console.warn("[features] Budget exhausted during batch research. Stopping early.");
      break;
    }

    // Rate limit: wait 2 seconds between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
