// src/lib/ingestion/seed-series.ts
import { prisma } from "@/lib/db/client";

/**
 * Seeds the DataSeries registry with all tracked series.
 * Idempotent — uses upsert, safe to run multiple times.
 */

interface SeriesDefinition {
  id: string;
  source: string;
  name: string;
  description: string;
  units: string;
  frequency: string;
  apiEndpoint: string;
}

const SERIES_DEFINITIONS: SeriesDefinition[] = [
  // ─── Treasury FiscalData ────────────────────────────────
  {
    id: "TREASURY:TOTAL_DEBT",
    source: "TREASURY",
    name: "Total Public Debt Outstanding",
    description: "Total public debt outstanding from the Debt to the Penny report",
    units: "$",
    frequency: "daily",
    apiEndpoint: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
  },
  {
    id: "TREASURY:DEBT_HELD_BY_PUBLIC",
    source: "TREASURY",
    name: "Debt Held by the Public",
    description: "Portion of national debt held by external investors, mutual funds, foreign governments, etc.",
    units: "$",
    frequency: "daily",
    apiEndpoint: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
  },
  {
    id: "TREASURY:INTRAGOV_HOLDINGS",
    source: "TREASURY",
    name: "Intragovernmental Holdings",
    description: "Debt held by government trust funds (Social Security, Medicare, etc.)",
    units: "$",
    frequency: "daily",
    apiEndpoint: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
  },
  {
    id: "TREASURY:TGA_BALANCE",
    source: "TREASURY",
    name: "Treasury General Account Balance",
    description: "The U.S. government's checking account at the Federal Reserve",
    units: "$",
    frequency: "daily",
    apiEndpoint: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/dts_table_1",
  },

  // ─── FRED Series ────────────────────────────────────────
  {
    id: "FRED:WALCL",
    source: "FRED",
    name: "Federal Reserve Balance Sheet",
    description: "Total assets held by the Federal Reserve (H.4.1 release)",
    units: "Mil $",
    frequency: "weekly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=WALCL",
  },
  {
    id: "FRED:RRPONTSYD",
    source: "FRED",
    name: "Overnight Reverse Repo Facility",
    description: "Total value of overnight reverse repurchase agreements with the Fed",
    units: "Bil $",
    frequency: "daily",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=RRPONTSYD",
  },
  {
    id: "FRED:DGS10",
    source: "FRED",
    name: "10-Year Treasury Yield",
    description: "10-Year Treasury Constant Maturity Rate",
    units: "%",
    frequency: "daily",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=DGS10",
  },
  {
    id: "FRED:DGS2",
    source: "FRED",
    name: "2-Year Treasury Yield",
    description: "2-Year Treasury Constant Maturity Rate",
    units: "%",
    frequency: "daily",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=DGS2",
  },
  {
    id: "FRED:T10Y2Y",
    source: "FRED",
    name: "Yield Curve Spread (10Y-2Y)",
    description: "10-Year minus 2-Year Treasury yield spread — a key recession indicator",
    units: "%",
    frequency: "daily",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=T10Y2Y",
  },
  {
    id: "FRED:FEDFUNDS",
    source: "FRED",
    name: "Effective Federal Funds Rate",
    description: "The interest rate at which banks lend reserves to each other overnight",
    units: "%",
    frequency: "monthly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS",
  },
  {
    id: "FRED:M2SL",
    source: "FRED",
    name: "M2 Money Supply",
    description: "Broad measure of money supply including cash, checking deposits, savings, and money market funds",
    units: "Bil $",
    frequency: "monthly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=M2SL",
  },
  {
    id: "FRED:CPIAUCSL",
    source: "FRED",
    name: "Consumer Price Index (CPI)",
    description: "Consumer Price Index for All Urban Consumers: All Items",
    units: "Index",
    frequency: "monthly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL",
  },
  {
    id: "FRED:GFDEGDQ188S",
    source: "FRED",
    name: "Federal Debt to GDP Ratio",
    description: "Federal Debt: Total Public Debt as Percent of Gross Domestic Product",
    units: "%",
    frequency: "quarterly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S",
  },
  {
    id: "FRED:A091RC1Q027SBEA",
    source: "FRED",
    name: "Federal Interest Payments",
    description: "Federal government current expenditures: Interest payments",
    units: "Bil $",
    frequency: "quarterly",
    apiEndpoint: "https://api.stlouisfed.org/fred/series/observations?series_id=A091RC1Q027SBEA",
  },

  // ─── Calculated Series ──────────────────────────────────
  {
    id: "CALC:NET_LIQUIDITY",
    source: "CALCULATED",
    name: "Net Liquidity",
    description: "Fed Balance Sheet (WALCL) minus TGA minus RRP — approximates total financial system liquidity",
    units: "$",
    frequency: "daily",
    apiEndpoint: "",
  },
];

export async function seedDataSeries(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const series of SERIES_DEFINITIONS) {
    const existing = await prisma.dataSeries.findUnique({
      where: { id: series.id },
    });

    if (existing) {
      await prisma.dataSeries.update({
        where: { id: series.id },
        data: {
          name: series.name,
          description: series.description,
          units: series.units,
          frequency: series.frequency,
          apiEndpoint: series.apiEndpoint,
        },
      });
      updated++;
    } else {
      await prisma.dataSeries.create({
        data: {
          id: series.id,
          source: series.source,
          name: series.name,
          description: series.description,
          units: series.units,
          frequency: series.frequency,
          apiEndpoint: series.apiEndpoint,
          isActive: true,
        },
      });
      created++;
    }
  }

  console.info(`[seed] Data series: ${created} created, ${updated} updated`);
  return { created, updated };
}
