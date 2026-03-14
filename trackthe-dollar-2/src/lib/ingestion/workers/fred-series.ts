// src/lib/ingestion/workers/fred-series.ts
import { BaseIngestionWorker } from "../base-worker";
import type { RawRecord, NormalizedPoint } from "../types";

const FRED_BASE = "https://api.stlouisfed.org/fred";

interface FredWorkerOptions {
  seriesId: string;       // FRED series ID (e.g., "WALCL")
  internalId: string;     // Our series ID (e.g., "FRED:WALCL")
  schedule: string;       // Cron expression
  limit?: number;         // Number of observations to fetch
}

/**
 * Generic FRED series ingestion worker.
 * Create one instance per FRED series.
 */
export class FredSeriesWorker extends BaseIngestionWorker {
  private fredSeriesId: string;
  private limit: number;

  constructor(options: FredWorkerOptions) {
    super({
      name: `fred-${options.seriesId.toLowerCase()}`,
      source: "FRED",
      seriesIds: [options.internalId],
      schedule: options.schedule,
      timeoutMs: 10_000,
      maxRetries: 3,
    });
    this.fredSeriesId = options.seriesId;
    this.limit = options.limit ?? 60;
  }

  private get apiKey(): string {
    const key = process.env.FRED_API_KEY;
    if (!key) throw new Error("FRED_API_KEY is not configured");
    return key;
  }

  async extract(): Promise<RawRecord[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const url = `${FRED_BASE}/series/observations?series_id=${this.fredSeriesId}&sort_order=desc&limit=${this.limit}&api_key=${this.apiKey}&file_type=json`;
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`FRED API returned HTTP ${res.status} for ${this.fredSeriesId}`);
      }

      const json = await res.json();
      return (json.observations ?? []).map((obs: { date: string; value: string }) => ({
        date: obs.date,
        value: obs.value,
      }));
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  transform(raw: RawRecord[]): NormalizedPoint[] {
    return raw
      .filter((r) => r.value !== "." && r.value !== "")
      .map((record) => ({
        seriesId: this.config.seriesIds[0],
        date: new Date(record.date as string),
        value: parseFloat(String(record.value)),
      }))
      .filter((p) => !isNaN(p.value));
  }
}

/**
 * Pre-configured FRED workers for all tracked series.
 */
export const FRED_WORKERS: FredWorkerOptions[] = [
  // Daily series
  { seriesId: "DGS10",      internalId: "FRED:DGS10",      schedule: "10 * * * *" },
  { seriesId: "DGS2",       internalId: "FRED:DGS2",       schedule: "10 * * * *" },
  { seriesId: "T10Y2Y",     internalId: "FRED:T10Y2Y",     schedule: "10 * * * *" },
  { seriesId: "RRPONTSYD",  internalId: "FRED:RRPONTSYD",  schedule: "10 * * * *" },

  // Weekly series
  { seriesId: "WALCL",      internalId: "FRED:WALCL",      schedule: "15 * * * *" },

  // Monthly series
  { seriesId: "FEDFUNDS",   internalId: "FRED:FEDFUNDS",   schedule: "0 6 * * *" },
  { seriesId: "M2SL",       internalId: "FRED:M2SL",       schedule: "0 6 * * *" },
  { seriesId: "CPIAUCSL",   internalId: "FRED:CPIAUCSL",   schedule: "0 6 * * *" },

  // Quarterly series
  { seriesId: "GFDEGDQ188S", internalId: "FRED:GFDEGDQ188S", schedule: "0 6 * * *" },
  { seriesId: "A091RC1Q027SBEA", internalId: "FRED:A091RC1Q027SBEA", schedule: "0 6 * * *" },
];

export function createFredWorkers(): FredSeriesWorker[] {
  return FRED_WORKERS.map((opts) => new FredSeriesWorker(opts));
}
