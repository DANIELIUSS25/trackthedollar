// src/lib/scheduler/schedules.ts

/**
 * Central schedule configuration for all ingestion and processing jobs.
 * Used by BullMQ scheduler in the TrackTheInternet worker process.
 */

export interface JobSchedule {
  name: string;
  queue: string;
  cron: string;
  description: string;
  enabled: boolean;
  timeoutMs: number;
  maxRetries: number;
}

export const JOB_SCHEDULES: JobSchedule[] = [
  // ─── High-frequency: Hourly ─────────────────────────────────
  {
    name: "treasury-debt",
    queue: "ingestion:treasury",
    cron: "0 * * * *",
    description: "Fetch Debt to the Penny from Treasury FiscalData API",
    enabled: true,
    timeoutMs: 30_000,
    maxRetries: 3,
  },
  {
    name: "treasury-tga",
    queue: "ingestion:treasury",
    cron: "5 * * * *",
    description: "Fetch TGA balance from Daily Treasury Statement",
    enabled: true,
    timeoutMs: 30_000,
    maxRetries: 3,
  },
  {
    name: "fred-dgs10",
    queue: "ingestion:fred",
    cron: "10 * * * *",
    description: "Fetch 10-Year Treasury Yield from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-dgs2",
    queue: "ingestion:fred",
    cron: "10 * * * *",
    description: "Fetch 2-Year Treasury Yield from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-t10y2y",
    queue: "ingestion:fred",
    cron: "10 * * * *",
    description: "Fetch Yield Curve Spread from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-rrpontsyd",
    queue: "ingestion:fred",
    cron: "10 * * * *",
    description: "Fetch Reverse Repo Facility balance from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-walcl",
    queue: "ingestion:fred",
    cron: "15 * * * *",
    description: "Fetch Fed Balance Sheet from FRED (weekly updates Thu)",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },

  // ─── Medium-frequency: Every 4 hours ────────────────────────
  {
    name: "treasury-auctions",
    queue: "ingestion:treasury",
    cron: "0 */4 * * *",
    description: "Fetch recent Treasury auction results",
    enabled: true,
    timeoutMs: 30_000,
    maxRetries: 3,
  },

  // ─── Low-frequency: Daily ───────────────────────────────────
  {
    name: "treasury-mts",
    queue: "ingestion:fiscal",
    cron: "0 6 * * *",
    description: "Fetch Monthly Treasury Statement data",
    enabled: true,
    timeoutMs: 60_000,
    maxRetries: 3,
  },
  {
    name: "fred-fedfunds",
    queue: "ingestion:fred",
    cron: "0 6 * * *",
    description: "Fetch Fed Funds Rate from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-m2sl",
    queue: "ingestion:fred",
    cron: "0 6 * * *",
    description: "Fetch M2 Money Supply from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-cpiaucsl",
    queue: "ingestion:fred",
    cron: "0 6 * * *",
    description: "Fetch CPI from FRED",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },
  {
    name: "fred-gfdegdq188s",
    queue: "ingestion:fred",
    cron: "0 6 * * *",
    description: "Fetch Debt-to-GDP ratio from FRED (quarterly)",
    enabled: true,
    timeoutMs: 15_000,
    maxRetries: 3,
  },

  // ─── Derived / Post-processing ──────────────────────────────
  {
    name: "snapshot-builder",
    queue: "ingestion:snapshot",
    cron: "30 * * * *",
    description: "Build denormalized daily snapshot from latest observations",
    enabled: true,
    timeoutMs: 30_000,
    maxRetries: 2,
  },

  // ─── Alert Evaluation ───────────────────────────────────────
  {
    name: "alert-evaluator",
    queue: "alerts:evaluate",
    cron: "*/5 * * * *",
    description: "Evaluate all active user alerts against latest data",
    enabled: true,
    timeoutMs: 60_000,
    maxRetries: 1,
  },

  // ─── AI Content ─────────────────────────────────────────────
  {
    name: "daily-briefing",
    queue: "ai:summarize",
    cron: "0 7 * * *",
    description: "Generate daily AI intelligence briefing",
    enabled: true,
    timeoutMs: 120_000,
    maxRetries: 2,
  },
  {
    name: "metric-explainers",
    queue: "ai:summarize",
    cron: "0 8 * * 1",
    description: "Regenerate metric explainer content (weekly Mon)",
    enabled: true,
    timeoutMs: 120_000,
    maxRetries: 2,
  },

  // ─── Perplexity-Powered AI Content ────────────────────────
  {
    name: "daily-narrative",
    queue: "ai:perplexity",
    cron: "15 7 * * *",
    description: "Generate daily narrative summary via Perplexity (after data ingestion)",
    enabled: true,
    timeoutMs: 60_000,
    maxRetries: 2,
  },
  {
    name: "what-changed-why",
    queue: "ai:perplexity",
    cron: "35 * * * *",
    description: "Generate 'what changed and why' explanations after snapshot build",
    enabled: true,
    timeoutMs: 45_000,
    maxRetries: 1,
  },
  {
    name: "weekly-research-notes",
    queue: "ai:perplexity",
    cron: "0 9 * * 1",
    description: "Generate batch research notes on curated topics (weekly Mon)",
    enabled: true,
    timeoutMs: 300_000,
    maxRetries: 1,
  },

  // ─── Blog Content ────────────────────────────────────────────
  {
    name: "blog-daily-news",
    queue: "blog:generate",
    cron: "0 10 * * *",
    description: "Generate one news-driven blog post daily via Perplexity",
    enabled: true,
    timeoutMs: 120_000,
    maxRetries: 2,
  },
  {
    name: "blog-education-seed",
    queue: "blog:generate",
    cron: "0 11 * * 1",
    description: "Seed up to 3 educational blog posts per week (Mon) if not yet created",
    enabled: true,
    timeoutMs: 300_000,
    maxRetries: 1,
  },
];

/**
 * Get queue names used across all schedules.
 */
export function getQueueNames(): string[] {
  return [...new Set(JOB_SCHEDULES.map((s) => s.queue))];
}

/**
 * Get schedules for a specific queue.
 */
export function getSchedulesForQueue(queue: string): JobSchedule[] {
  return JOB_SCHEDULES.filter((s) => s.queue === queue && s.enabled);
}
