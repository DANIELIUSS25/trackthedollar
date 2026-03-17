// src/lib/api/treasury.ts
// Client for the U.S. Treasury FiscalData API (https://fiscaldata.treasury.gov/api-documentation/)

import type {
  DebtSnapshot,
  FiscalSnapshot,
  SpendingCategory,
  RevenueSource,
  TreasuryAuction,
  TimeSeriesPoint,
} from "@/types/dollar";

const FISCAL_DATA_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";

interface FiscalDataResponse<T> {
  data: T[];
  meta: {
    count: number;
    "total-count": number;
    "total-pages": number;
  };
}

async function fiscalFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<FiscalDataResponse<T>> {
  const url = new URL(`${FISCAL_DATA_BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`Treasury FiscalData API error (HTTP ${res.status})`);
    }
    return res.json() as Promise<FiscalDataResponse<T>>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── National Debt ──────────────────────────────────────────────────────────

interface DebtRawRecord {
  record_date: string;
  tot_pub_debt_out_amt: string;
  debt_held_public_amt: string;
  intragov_hold_amt: string;
}

export async function fetchDebtSnapshot(): Promise<DebtSnapshot> {
  const res = await fiscalFetch<DebtRawRecord>(
    "/v2/accounting/od/debt_to_penny",
    {
      sort: "-record_date",
      page_size: "1",
      fields: "record_date,tot_pub_debt_out_amt,debt_held_public_amt,intragov_hold_amt",
    }
  );

  const record = res.data[0];
  if (!record) throw new Error("No debt data available");

  const totalPublicDebt = parseFloat(record.tot_pub_debt_out_amt);
  const debtHeldByPublic = parseFloat(record.debt_held_public_amt);
  const intragovernmental = parseFloat(record.intragov_hold_amt);

  return {
    totalPublicDebt,
    debtHeldByPublic,
    intragovernmental,
    marketable: debtHeldByPublic, // Approximation; detailed breakdown requires separate endpoint
    nonMarketable: intragovernmental,
    date: record.record_date,
  };
}

export async function fetchDebtHistory(days = 365): Promise<TimeSeriesPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split("T")[0];

  const res = await fiscalFetch<DebtRawRecord>(
    "/v2/accounting/od/debt_to_penny",
    {
      sort: "record_date",
      page_size: "366",
      fields: "record_date,tot_pub_debt_out_amt",
      "filter": `record_date:gte:${startStr}`,
    }
  );

  return res.data.map((r) => ({
    date: r.record_date,
    value: parseFloat(r.tot_pub_debt_out_amt),
  }));
}

// ─── Treasury General Account (TGA) ────────────────────────────────────────

interface TGARawRecord {
  record_date: string;
  close_today_bal: string;
  account_type: string;
}

export async function fetchTGABalance(): Promise<{ balance: number; date: string }> {
  const res = await fiscalFetch<TGARawRecord>(
    "/v1/accounting/dts/deposits_withdrawals_operating_cash",
    {
      sort: "-record_date",
      page_size: "1",
      fields: "record_date,close_today_bal,account_type",
      "filter": "account_type:eq:Federal Reserve Account",
    }
  );

  const record = res.data[0];
  if (!record) throw new Error("No TGA data available");

  return {
    balance: parseFloat(record.close_today_bal) * 1_000_000, // Values in millions
    date: record.record_date,
  };
}

export async function fetchTGAHistory(days = 365): Promise<TimeSeriesPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split("T")[0];

  const res = await fiscalFetch<TGARawRecord>(
    "/v1/accounting/dts/deposits_withdrawals_operating_cash",
    {
      sort: "record_date",
      page_size: "300",
      fields: "record_date,close_today_bal,account_type",
      "filter": `account_type:eq:Federal Reserve Account,record_date:gte:${startStr}`,
    }
  );

  return res.data.map((r) => ({
    date: r.record_date,
    value: parseFloat(r.close_today_bal) * 1_000_000,
  }));
}

// ─── Monthly Treasury Statement (Receipts & Outlays) ────────────────────────

interface MTSRawRecord {
  record_date: string;
  current_month_gross_rcpt_amt: string;
  current_month_gross_outly_amt: string;
  current_month_net_rcpt_amt: string;
  current_fytd_gross_rcpt_amt: string;
  current_fytd_gross_outly_amt: string;
  current_fytd_net_rcpt_amt: string;
}

export async function fetchFiscalSnapshot(): Promise<{
  currentMonth: FiscalSnapshot;
  fiscalYTD: FiscalSnapshot;
}> {
  const res = await fiscalFetch<MTSRawRecord>(
    "/v1/accounting/mts/mts_table_1",
    {
      sort: "-record_date",
      page_size: "1",
      fields: "record_date,current_month_gross_rcpt_amt,current_month_gross_outly_amt,current_month_net_rcpt_amt,current_fytd_gross_rcpt_amt,current_fytd_gross_outly_amt,current_fytd_net_rcpt_amt",
    }
  );

  const record = res.data[0];
  if (!record) throw new Error("No fiscal data available");

  const monthReceipts = parseFloat(record.current_month_gross_rcpt_amt) * 1_000_000;
  const monthOutlays = parseFloat(record.current_month_gross_outly_amt) * 1_000_000;
  const ytdReceipts = parseFloat(record.current_fytd_gross_rcpt_amt) * 1_000_000;
  const ytdOutlays = parseFloat(record.current_fytd_gross_outly_amt) * 1_000_000;

  const date = record.record_date;
  const period = date.substring(0, 7); // YYYY-MM

  return {
    currentMonth: {
      totalReceipts: monthReceipts,
      totalOutlays: monthOutlays,
      surplus_deficit: monthReceipts - monthOutlays,
      period,
      periodType: "monthly",
    },
    fiscalYTD: {
      totalReceipts: ytdReceipts,
      totalOutlays: ytdOutlays,
      surplus_deficit: ytdReceipts - ytdOutlays,
      period: `FY${getFiscalYear(date)}`,
      periodType: "fiscal_year_to_date",
    },
  };
}

// ─── Spending by Category ───────────────────────────────────────────────────

interface SpendingRawRecord {
  record_date: string;
  classification_desc: string;
  current_fytd_net_outly_amt: string;
  prior_fytd_net_outly_amt: string;
}

export async function fetchSpendingByCategory(): Promise<SpendingCategory[]> {
  const res = await fiscalFetch<SpendingRawRecord>(
    "/v1/accounting/mts/mts_table_9",
    {
      sort: "-record_date",
      page_size: "50",
      fields: "record_date,classification_desc,current_fytd_net_outly_amt,prior_fytd_net_outly_amt",
    }
  );

  // Get only the most recent date's records
  if (res.data.length === 0) return [];
  const latestDate = res.data[0]!.record_date;
  const records = res.data.filter((r) => r.record_date === latestDate);

  const totalOutlays = records.reduce(
    (sum, r) => sum + Math.abs(parseFloat(r.current_fytd_net_outly_amt)),
    0
  );

  return records
    .map((r) => {
      const amount = parseFloat(r.current_fytd_net_outly_amt) * 1_000_000;
      const priorAmount = parseFloat(r.prior_fytd_net_outly_amt) * 1_000_000;
      return {
        category: r.classification_desc,
        amount,
        percentOfTotal:
          totalOutlays > 0
            ? (Math.abs(parseFloat(r.current_fytd_net_outly_amt)) / totalOutlays) * 100
            : 0,
        priorYearAmount: priorAmount || null,
        yoyChange:
          priorAmount !== 0
            ? ((amount - priorAmount) / Math.abs(priorAmount)) * 100
            : null,
      };
    })
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

// ─── Revenue by Source ──────────────────────────────────────────────────────

interface RevenueRawRecord {
  record_date: string;
  classification_desc: string;
  current_fytd_rcpt_outly_amt: string;
  prior_fytd_rcpt_outly_amt: string;
}

export async function fetchRevenueBySource(): Promise<RevenueSource[]> {
  const res = await fiscalFetch<RevenueRawRecord>(
    "/v1/accounting/mts/mts_table_4",
    {
      sort: "-record_date",
      page_size: "30",
      fields: "record_date,classification_desc,current_fytd_rcpt_outly_amt,prior_fytd_rcpt_outly_amt",
    }
  );

  if (res.data.length === 0) return [];
  const latestDate = res.data[0]!.record_date;
  const records = res.data.filter((r) => r.record_date === latestDate);

  const totalReceipts = records.reduce(
    (sum, r) => sum + Math.abs(parseFloat(r.current_fytd_rcpt_outly_amt)),
    0
  );

  return records
    .map((r) => {
      const amount = parseFloat(r.current_fytd_rcpt_outly_amt) * 1_000_000;
      const priorAmount = parseFloat(r.prior_fytd_rcpt_outly_amt) * 1_000_000;
      return {
        source: r.classification_desc,
        amount,
        percentOfTotal:
          totalReceipts > 0
            ? (Math.abs(parseFloat(r.current_fytd_rcpt_outly_amt)) / totalReceipts) * 100
            : 0,
        priorYearAmount: priorAmount || null,
        yoyChange:
          priorAmount !== 0
            ? ((amount - priorAmount) / Math.abs(priorAmount)) * 100
            : null,
      };
    })
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

// ─── Treasury Auctions ──────────────────────────────────────────────────────

interface AuctionRawRecord {
  record_date: string;
  security_type: string;
  security_term: string;
  auction_date: string;
  issue_date: string;
  maturity_date: string;
  offering_amt: string;
  high_yield: string;
  bid_to_cover_ratio: string;
  perc_indirect_bidders_accepted: string;
  perc_direct_bidders_accepted: string;
  perc_primary_dealers_accepted: string;
}

export async function fetchRecentAuctions(limit = 20): Promise<TreasuryAuction[]> {
  const res = await fiscalFetch<AuctionRawRecord>(
    "/v1/accounting/od/auctions_query",
    {
      sort: "-auction_date",
      page_size: String(limit),
      fields: "record_date,security_type,security_term,auction_date,issue_date,maturity_date,offering_amt,high_yield,bid_to_cover_ratio,perc_indirect_bidders_accepted,perc_direct_bidders_accepted,perc_primary_dealers_accepted",
    }
  );

  return res.data.map((r) => ({
    securityType: r.security_type as TreasuryAuction["securityType"],
    securityTerm: r.security_term,
    auctionDate: r.auction_date,
    issueDate: r.issue_date,
    maturityDate: r.maturity_date,
    offeringAmount: parseFloat(r.offering_amt) * 1_000_000,
    highYield: r.high_yield ? parseFloat(r.high_yield) : null,
    bidToCover: r.bid_to_cover_ratio ? parseFloat(r.bid_to_cover_ratio) : null,
    allocationPctIndirect: r.perc_indirect_bidders_accepted
      ? parseFloat(r.perc_indirect_bidders_accepted)
      : null,
    allocationPctDirect: r.perc_direct_bidders_accepted
      ? parseFloat(r.perc_direct_bidders_accepted)
      : null,
    allocationPctPrimary: r.perc_primary_dealers_accepted
      ? parseFloat(r.perc_primary_dealers_accepted)
      : null,
    status: "completed" as const,
  }));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getFiscalYear(dateStr: string): number {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 1-indexed
  const year = date.getFullYear();
  // Federal fiscal year starts October 1
  return month >= 10 ? year + 1 : year;
}
