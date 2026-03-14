// src/lib/ingestion/index.ts

export { BaseIngestionWorker } from "./base-worker";
export { TreasuryDebtWorker } from "./workers/treasury-debt";
export { TreasuryTGAWorker } from "./workers/treasury-tga";
export { FredSeriesWorker, createFredWorkers, FRED_WORKERS } from "./workers/fred-series";
export { buildDailySnapshot } from "./workers/snapshot-builder";
export type {
  RawRecord,
  NormalizedPoint,
  ValidationResult,
  LoadResult,
  IngestionResult,
  DataSourceType,
  WorkerConfig,
} from "./types";
