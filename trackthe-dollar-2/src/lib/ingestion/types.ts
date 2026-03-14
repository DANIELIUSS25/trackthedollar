// src/lib/ingestion/types.ts

export interface RawRecord {
  date: string;
  value: string | number;
  [key: string]: unknown;
}

export interface NormalizedPoint {
  seriesId: string;
  date: Date;
  value: number;
  vintage?: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
}

export interface LoadResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface IngestionResult {
  jobName: string;
  status: "success" | "failed" | "skipped";
  startedAt: Date;
  finishedAt: Date;
  duration: number;
  recordsIn: number;
  recordsOut: number;
  error?: string;
}

export type DataSourceType = "FRED" | "TREASURY" | "FISCAL" | "CALCULATED";

export interface WorkerConfig {
  name: string;
  source: DataSourceType;
  seriesIds: string[];
  schedule: string; // cron expression
  timeoutMs: number;
  maxRetries: number;
}
