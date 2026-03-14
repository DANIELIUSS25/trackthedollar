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
