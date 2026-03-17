// src/lib/ingestion/base-worker.ts
import { prisma } from "@/lib/db/client";
import type {
  RawRecord,
  NormalizedPoint,
  ValidationResult,
  LoadResult,
  IngestionResult,
  WorkerConfig,
} from "./types";

/**
 * Base class for all ingestion workers.
 * Subclasses implement extract(), validate(), and transform().
 * The load() and run() methods are standardized.
 */
export abstract class BaseIngestionWorker {
  protected config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;
  }

  /** Fetch raw data from the upstream API */
  abstract extract(): Promise<RawRecord[]>;

  /** Validate raw data shape and quality */
  validate(raw: RawRecord[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (raw.length === 0) {
      warnings.push("No records returned from source");
      return { valid: true, errors, warnings, recordCount: 0 };
    }

    for (let i = 0; i < raw.length; i++) {
      const record = raw[i];
      if (!record.date) {
        errors.push(`Record ${i}: missing date`);
      }
      if (record.value === undefined || record.value === null) {
        errors.push(`Record ${i}: missing value`);
      }
      if (typeof record.value === "string" && record.value === ".") {
        warnings.push(`Record ${i}: FRED missing-value indicator (.)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recordCount: raw.length,
    };
  }

  /** Transform raw records into normalized observations */
  abstract transform(raw: RawRecord[]): NormalizedPoint[];

  /** Upsert normalized points into the observations table */
  async load(points: NormalizedPoint[]): Promise<LoadResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const point of points) {
      try {
        const existing = await prisma.observation.findUnique({
          where: {
            seriesId_date_vintage: {
              seriesId: point.seriesId,
              date: point.date,
              vintage: point.vintage ?? new Date(),
            },
          },
        });

        if (existing) {
          if (existing.value.toNumber() !== point.value) {
            await prisma.observation.update({
              where: { id: existing.id },
              data: { value: point.value },
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await prisma.observation.create({
            data: {
              seriesId: point.seriesId,
              date: point.date,
              value: point.value,
              vintage: point.vintage ?? new Date(),
            },
          });
          inserted++;
        }
      } catch (err) {
        console.error(`[${this.config.name}] Load error for ${point.seriesId} @ ${point.date}:`, err);
        errors++;
      }
    }

    return { inserted, updated, skipped, errors };
  }

  /** Run the full ETL pipeline with logging */
  async run(): Promise<IngestionResult> {
    const startedAt = new Date();

    // Create log entry
    const log = await prisma.ingestionLog.create({
      data: {
        jobName: this.config.name,
        status: "running",
        startedAt,
      },
    });

    try {
      // Extract
      const raw = await this.extract();

      // Validate
      const validation = this.validate(raw);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join("; ")}`);
      }

      if (validation.recordCount === 0) {
        const finishedAt = new Date();
        await prisma.ingestionLog.update({
          where: { id: log.id },
          data: {
            status: "skipped",
            finishedAt,
            duration: finishedAt.getTime() - startedAt.getTime(),
            recordsIn: 0,
            recordsOut: 0,
            metadata: { warnings: validation.warnings },
          },
        });

        return {
          jobName: this.config.name,
          status: "skipped",
          startedAt,
          finishedAt,
          duration: finishedAt.getTime() - startedAt.getTime(),
          recordsIn: 0,
          recordsOut: 0,
        };
      }

      // Filter out FRED missing-value indicators
      const cleanRaw = raw.filter((r) => r.value !== "." && r.value !== "");

      // Transform
      const points = this.transform(cleanRaw);

      // Load
      const loadResult = await this.load(points);

      const finishedAt = new Date();
      const result: IngestionResult = {
        jobName: this.config.name,
        status: "success",
        startedAt,
        finishedAt,
        duration: finishedAt.getTime() - startedAt.getTime(),
        recordsIn: raw.length,
        recordsOut: loadResult.inserted + loadResult.updated,
      };

      await prisma.ingestionLog.update({
        where: { id: log.id },
        data: {
          status: "success",
          finishedAt,
          duration: result.duration,
          recordsIn: result.recordsIn,
          recordsOut: result.recordsOut,
          metadata: JSON.parse(JSON.stringify({
            warnings: validation.warnings,
            loadResult,
          })),
        },
      });

      return result;
    } catch (err) {
      const finishedAt = new Date();
      const errorMessage = err instanceof Error ? err.message : String(err);

      await prisma.ingestionLog.update({
        where: { id: log.id },
        data: {
          status: "failed",
          finishedAt,
          duration: finishedAt.getTime() - startedAt.getTime(),
          error: errorMessage,
        },
      });

      return {
        jobName: this.config.name,
        status: "failed",
        startedAt,
        finishedAt,
        duration: finishedAt.getTime() - startedAt.getTime(),
        recordsIn: 0,
        recordsOut: 0,
        error: errorMessage,
      };
    }
  }
}
