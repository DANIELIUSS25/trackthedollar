// src/lib/ingestion/workers/treasury-tga.ts
import { BaseIngestionWorker } from "../base-worker";
import type { RawRecord, NormalizedPoint } from "../types";

const API_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";
const ENDPOINT = "/v1/accounting/dts/dts_table_1";

/**
 * Ingests Treasury General Account (TGA) balance from the Daily Treasury Statement.
 */
export class TreasuryTGAWorker extends BaseIngestionWorker {
  constructor() {
    super({
      name: "treasury-tga",
      source: "TREASURY",
      seriesIds: ["TREASURY:TGA_BALANCE"],
      schedule: "5 * * * *", // 5 past every hour
      timeoutMs: 15_000,
      maxRetries: 3,
    });
  }

  async extract(): Promise<RawRecord[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const url = `${API_BASE}${ENDPOINT}?sort=-record_date&page[size]=10&fields=record_date,close_today_bal&filter=account_type:eq:Federal Reserve Account`;
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Treasury DTS API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      return (json.data ?? []).map((row: Record<string, string>) => ({
        date: row.record_date,
        value: row.close_today_bal,
      }));
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  transform(raw: RawRecord[]): NormalizedPoint[] {
    return raw
      .map((record) => ({
        seriesId: "TREASURY:TGA_BALANCE",
        date: new Date(record.date as string),
        value: parseFloat(String(record.value)) * 1_000_000, // millions
      }))
      .filter((p) => !isNaN(p.value));
  }
}
