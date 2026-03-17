// src/lib/scheduler/runner.ts

/**
 * Lightweight job runner for environments without BullMQ (e.g., serverless).
 * Uses setInterval + cron-style matching for scheduling.
 *
 * For production worker processes (TrackTheInternet), replace this with BullMQ.
 * This runner is useful for development and single-server deployments.
 */

import { TreasuryDebtWorker } from "@/lib/ingestion/workers/treasury-debt";
import { TreasuryTGAWorker } from "@/lib/ingestion/workers/treasury-tga";
import { FredSeriesWorker, FRED_WORKERS } from "@/lib/ingestion/workers/fred-series";
import { buildDailySnapshot } from "@/lib/ingestion/workers/snapshot-builder";
import type { IngestionResult } from "@/lib/ingestion/types";

type JobRunner = () => Promise<IngestionResult | void>;

interface RegisteredJob {
  name: string;
  runner: JobRunner;
  intervalMs: number;
  lastRun: number;
}

const jobs: RegisteredJob[] = [];

/**
 * Register all ingestion workers with their intervals.
 */
export function registerAllJobs(): void {
  const HOUR = 60 * 60 * 1000;
  const FOUR_HOURS = 4 * HOUR;
  // Treasury workers
  const debtWorker = new TreasuryDebtWorker();
  register("treasury-debt", () => debtWorker.run(), HOUR);

  const tgaWorker = new TreasuryTGAWorker();
  register("treasury-tga", () => tgaWorker.run(), HOUR);

  // FRED workers
  for (const config of FRED_WORKERS) {
    const worker = new FredSeriesWorker(config);
    const interval = config.schedule.includes("*/")
      ? FOUR_HOURS
      : config.schedule.startsWith("0 6")
        ? 24 * HOUR
        : HOUR;
    register(`fred-${config.seriesId.toLowerCase()}`, () => worker.run(), interval);
  }

  // Snapshot builder (runs 30 min after each hour)
  register("snapshot-builder", async () => {
    await buildDailySnapshot();
  }, HOUR);

  console.info(`[scheduler] Registered ${jobs.length} jobs`);
}

function register(name: string, runner: JobRunner, intervalMs: number): void {
  jobs.push({ name, runner, intervalMs, lastRun: 0 });
}

/**
 * Run all jobs that are due.
 * Call this from a setInterval or cron trigger.
 */
export async function tick(): Promise<void> {
  const now = Date.now();

  for (const job of jobs) {
    if (now - job.lastRun >= job.intervalMs) {
      job.lastRun = now;
      try {
        console.info(`[scheduler] Running ${job.name}`);
        const result = await job.runner();
        if (result && "status" in result) {
          console.info(`[scheduler] ${job.name}: ${result.status} (${result.duration}ms, ${result.recordsOut} records)`);
        }
      } catch (err) {
        console.error(`[scheduler] ${job.name} failed:`, err);
      }
    }
  }
}

/**
 * Start the scheduler loop.
 * Checks every 60 seconds for due jobs.
 */
export function startScheduler(): NodeJS.Timeout {
  registerAllJobs();

  // Run immediately on start
  void tick();

  // Then check every 60 seconds
  return setInterval(() => void tick(), 60_000);
}

/**
 * Run a specific job by name (for manual triggers / admin panel).
 */
export async function runJob(name: string): Promise<IngestionResult | void> {
  const job = jobs.find((j) => j.name === name);
  if (!job) {
    throw new Error(`Unknown job: ${name}`);
  }

  console.info(`[scheduler] Manual run: ${name}`);
  job.lastRun = Date.now();
  return job.runner();
}
