// src/lib/ingestion/workers/treasury-debt.ts
import { BaseIngestionWorker } from "../base-worker";
import type { RawRecord, NormalizedPoint } from "../types";

const API_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";
const ENDPOINT = "/v2/accounting/od/debt_to_penny";

/**
 * Ingests total public debt from Treasury's "Debt to the Penny" API.
 * Updates daily on business days with a 1-day delay.
 */
export class TreasuryDebtWorker extends BaseIngestionWorker {
  constructor() {
    super({
      name: "treasury-debt",
      source: "TREASURY",
      seriesIds: [
        "TREASURY:TOTAL_DEBT",
        "TREASURY:DEBT_HELD_BY_PUBLIC",
        "TREASURY:INTRAGOV_HOLDINGS",
      ],
      schedule: "0 * * * *", // every hour
      timeoutMs: 15_000,
      maxRetries: 3,
    });
  }

  async extract(): Promise<RawRecord[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const url = `${API_BASE}${ENDPOINT}?sort=-record_date&page[size]=10&fields=record_date,tot_pub_debt_out_amt,debt_held_public_amt,intragov_hold_amt`;
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Treasury API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      return (json.data ?? []).map((row: Record<string, string>) => ({
        date: row.record_date,
        value: row.tot_pub_debt_out_amt,
        debtHeldByPublic: row.debt_held_public_amt,
        intragovHoldings: row.intragov_hold_amt,
      }));
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  transform(raw: RawRecord[]): NormalizedPoint[] {
    const points: NormalizedPoint[] = [];

    for (const record of raw) {
      const date = new Date(record.date as string);

      // Total public debt
      points.push({
        seriesId: "TREASURY:TOTAL_DEBT",
        date,
        value: parseFloat(String(record.value)) * 1_000_000, // API returns millions
      });

      // Debt held by public
      if (record.debtHeldByPublic) {
        points.push({
          seriesId: "TREASURY:DEBT_HELD_BY_PUBLIC",
          date,
          value: parseFloat(String(record.debtHeldByPublic)) * 1_000_000,
        });
      }

      // Intragovernmental holdings
      if (record.intragovHoldings) {
        points.push({
          seriesId: "TREASURY:INTRAGOV_HOLDINGS",
          date,
          value: parseFloat(String(record.intragovHoldings)) * 1_000_000,
        });
      }
    }

    return points.filter((p) => !isNaN(p.value));
  }
}
