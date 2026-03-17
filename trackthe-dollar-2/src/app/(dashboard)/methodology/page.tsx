"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Shell } from "@/components/layout/Shell";
import {
  Database,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function MethodologyPage() {
  return (
    <>
      <TopBar
        title="Methodology"
        subtitle="Data Sources, Update Frequencies & Calculation Methods"
      />

      <Shell>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* ─── Introduction ────────────────────────────── */}
          <div className="panel-hero p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Our Commitment to Data Integrity
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Every number on TrackTheDollar comes from official U.S. government data sources.
                  We do not estimate, interpolate, or adjust raw government data unless explicitly
                  stated (e.g., net liquidity calculations). All data shows its source, last update
                  time, and confidence indicator.
                </p>
              </div>
            </div>
          </div>

          {/* ─── Data Sources ────────────────────────────── */}
          <section>
            <SectionTitle icon={<Database />} title="Data Sources" />

            <div className="space-y-4">
              <DataSourceCard
                name="U.S. Treasury — Debt to the Penny"
                endpoint="api.fiscaldata.treasury.gov/v2/accounting/od/debt_to_penny"
                description="Total public debt outstanding, debt held by public, and intragovernmental holdings. The authoritative source for the national debt figure."
                frequency="Daily (business days)"
                delay="1 business day"
                metrics={["Total Public Debt", "Debt Held by Public", "Intragovernmental Holdings"]}
              />

              <DataSourceCard
                name="U.S. Treasury — Daily Treasury Statement"
                endpoint="api.fiscaldata.treasury.gov/v1/accounting/dts"
                description="The Treasury General Account (TGA) balance — the U.S. government's checking account at the Federal Reserve. Also includes daily deposits and withdrawals."
                frequency="Daily (business days)"
                delay="1 business day"
                metrics={["TGA Balance", "Daily Cash Position"]}
              />

              <DataSourceCard
                name="U.S. Treasury — Monthly Treasury Statement"
                endpoint="api.fiscaldata.treasury.gov/v1/accounting/mts"
                description="Comprehensive monthly report of federal receipts, outlays, and the resulting surplus or deficit. Includes breakdowns by spending category and revenue source."
                frequency="Monthly"
                delay="~15 business days after month end"
                metrics={["Federal Receipts", "Federal Outlays", "Budget Surplus/Deficit", "Spending by Category", "Revenue by Source"]}
              />

              <DataSourceCard
                name="Federal Reserve Economic Data (FRED)"
                endpoint="api.stlouisfed.org/fred"
                description="The Federal Reserve Bank of St. Louis maintains FRED, the most comprehensive database of U.S. economic data. We pull monetary policy, rates, and financial conditions data."
                frequency="Varies by series"
                delay="Varies (same day to 2 months)"
                metrics={[
                  "WALCL — Fed Balance Sheet (weekly)",
                  "RRPONTSYD — Reverse Repo Facility (daily)",
                  "FEDFUNDS — Fed Funds Rate (monthly)",
                  "DGS10 / DGS2 — Treasury Yields (daily)",
                  "T10Y2Y — Yield Curve Spread (daily)",
                  "M2SL — M2 Money Supply (monthly)",
                  "CPIAUCSL — Consumer Price Index (monthly)",
                  "GFDEGDQ188S — Debt-to-GDP Ratio (quarterly)",
                  "A091RC1Q027SBEA — Interest Payments (quarterly)",
                ]}
              />

              <DataSourceCard
                name="U.S. Treasury — Auction Results"
                endpoint="api.fiscaldata.treasury.gov/v1/accounting/od/auctions_query"
                description="Results from Treasury security auctions including bills, notes, bonds, TIPS, and floating rate notes. Includes yield, bid-to-cover ratio, and allocation data."
                frequency="Per auction (multiple per week)"
                delay="Same day"
                metrics={["Auction Yields", "Bid-to-Cover Ratios", "Allocation Percentages"]}
              />

              <DataSourceCard
                name="Bureau of Labor Statistics (BLS)"
                endpoint="api.bls.gov/publicAPI/v2/timeseries/data/"
                description="The BLS publishes the Consumer Price Index (CPI), the primary measure of inflation in the United States. We track both headline CPI and Core CPI (excluding food and energy)."
                frequency="Monthly"
                delay="~2 weeks after reference month"
                metrics={["CPI All Items (CUSR0000SA0)", "Core CPI (CUSR0000SA0L1E)"]}
              />

              <DataSourceCard
                name="USAspending.gov"
                endpoint="api.usaspending.gov/api/v2/agency/097/"
                description="Official source for federal spending data. We track Department of Defense (Agency 097) budgetary resources, obligations, and outlays across fiscal years."
                frequency="Annual (by fiscal year)"
                delay="Varies (quarterly updates)"
                metrics={["DoD Budgetary Resources", "DoD Obligations", "DoD Outlays", "DoD Contract Awards"]}
              />

              <DataSourceCard
                name="Foreign Assistance — USAID Open Data"
                endpoint="data.usaid.gov/resource/k87i-9i5x.json"
                description="U.S. foreign assistance data from the USAID open data portal via Socrata API. Covers economic, military, and humanitarian aid by country and sector."
                frequency="Annual"
                delay="Varies"
                metrics={["Total Obligations by Country", "Total Disbursements", "Security Assistance"]}
              />
            </div>
          </section>

          {/* ─── Calculations ────────────────────────────── */}
          <section>
            <SectionTitle icon={<CheckCircle />} title="Calculated Metrics" />

            <div className="space-y-4">
              <CalculationCard
                name="Net Liquidity"
                formula="Net Liquidity = Fed Balance Sheet (WALCL) − Treasury General Account (TGA) − Reverse Repo Facility (RRP)"
                description="Net liquidity approximates the total available liquidity in the financial system. When the Fed shrinks its balance sheet (QT), or when the TGA fills up (Treasury borrowing), or when RRP usage rises, net liquidity decreases. This metric is widely used by macro analysts to gauge financial conditions."
                caveats={[
                  "This is a simplified approximation, not an official Fed metric",
                  "Component data updates at different frequencies (WALCL weekly, TGA daily, RRP daily)",
                  "Does not account for all liquidity factors (e.g., bank lending, foreign repo)",
                ]}
              />

              <CalculationCard
                name="Debt Growth Rates"
                formula="Daily Change = Today's Debt − Yesterday's Debt"
                description="We calculate daily, 30-day, and 12-month debt growth directly from the Debt to the Penny series. The average daily increase is the 30-day change divided by 30."
                caveats={[
                  "Debt only updates on business days; weekends show no change",
                  "Large single-day swings often reflect auction settlement timing, not fiscal policy changes",
                ]}
              />

              <CalculationCard
                name="Monetary Expansion Proxy"
                formula="Score = 0.35 × WALCL_z + 0.30 × WRESBAL_z + 0.20 × M2_growth_z + 0.15 × debt_velocity_norm"
                description="A composite score (0–100) estimating monetary expansion pressure. Uses z-scores over rolling windows to normalize each component, then weights them into a single indicator."
                caveats={[
                  "This is a derived estimate, not a published government statistic",
                  "Z-scores are sensitive to the lookback window chosen (13 weeks)",
                  "Does not capture all monetary policy channels (e.g., forward guidance, credit conditions)",
                ]}
              />

              <CalculationCard
                name="War Spending Proxy"
                formula="Score = 0.45 × DoD_obligations_z + 0.20 × contract_share_z + 0.35 × security_aid_z"
                description="A composite score (0–100) estimating defense/military spending activity. Combines DoD obligation growth, the share of contracts in awards, and security assistance growth."
                caveats={[
                  "This is a derived estimate, not a published government statistic",
                  "Annual data means slow signal updates",
                  "Security assistance classification depends on sector labels in USAID data",
                ]}
              />

              <CalculationCard
                name="Year-over-Year Changes"
                formula="YoY Change = (Current Period − Prior Year Period) / |Prior Year Period| × 100"
                description="Spending and revenue YoY comparisons use the Monthly Treasury Statement's prior fiscal year-to-date figures as reported by Treasury."
                caveats={[
                  "Fiscal year runs October 1 through September 30",
                  "Calendar effects (e.g., payment timing shifts) can distort monthly comparisons",
                ]}
              />
            </div>
          </section>

          {/* ─── Update Frequency ────────────────────────── */}
          <section>
            <SectionTitle icon={<Clock />} title="Update Frequency & Caching" />

            <div className="panel overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="px-4 py-3 text-left label-md text-muted-foreground">Metric</th>
                    <th className="px-4 py-3 text-left label-md text-muted-foreground">Source Update</th>
                    <th className="px-4 py-3 text-left label-md text-muted-foreground">Our Cache TTL</th>
                    <th className="px-4 py-3 text-left label-md text-muted-foreground">Freshness</th>
                  </tr>
                </thead>
                <tbody>
                  {FREQUENCY_TABLE.map((row) => (
                    <tr key={row.metric} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-2.5 text-sm text-foreground">{row.metric}</td>
                      <td className="px-4 py-2.5 font-data text-xs text-muted-foreground">{row.sourceFreq}</td>
                      <td className="px-4 py-2.5 font-data text-xs text-muted-foreground">{row.cacheTtl}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-2xs ${row.freshnessColor}`}>
                          <span className={row.dotClass} />
                          {row.freshness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Known Limitations ────────────────────────── */}
          <section>
            <SectionTitle icon={<AlertTriangle />} title="Known Limitations" />

            <div className="panel p-5">
              <ul className="space-y-3">
                {LIMITATIONS.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 status-dot bg-warning" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{limitation}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ─── Source Footer ────────────────────────────── */}
          <div className="rounded-md border border-border bg-surface-2/50 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              All data on TrackTheDollar is sourced from public U.S. government APIs.
              This platform is not affiliated with the U.S. Treasury or Federal Reserve.
              Nothing on this site constitutes financial advice.
            </p>
          </div>
        </div>
      </Shell>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function DataSourceCard({
  name,
  endpoint,
  description,
  frequency,
  delay,
  metrics,
}: {
  name: string;
  endpoint: string;
  description: string;
  frequency: string;
  delay: string;
  metrics: string[];
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <code className="mt-1 block text-2xs text-muted-foreground/60">{endpoint}</code>
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="text-right">
            <span className="label-sm text-muted-foreground">Frequency</span>
            <p className="font-data text-xs text-foreground">{frequency}</p>
          </div>
          <div className="text-right">
            <span className="label-sm text-muted-foreground">Delay</span>
            <p className="font-data text-xs text-foreground">{delay}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {metrics.map((m) => (
          <span
            key={m}
            className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-2xs text-muted-foreground"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function CalculationCard({
  name,
  formula,
  description,
  caveats,
}: {
  name: string;
  formula: string;
  description: string;
  caveats: string[];
}) {
  return (
    <div className="panel p-5">
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      <div className="mt-2 rounded-md border border-primary/10 bg-primary/5 px-3 py-2">
        <code className="font-data text-xs text-primary">{formula}</code>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {caveats.length > 0 && (
        <div className="mt-3 rounded-md border border-warning/10 bg-warning-subtle px-3 py-2">
          <span className="label-sm text-warning">Caveats</span>
          <ul className="mt-1 space-y-1">
            {caveats.map((c, i) => (
              <li key={i} className="text-2xs leading-relaxed text-muted-foreground">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Static data ───────────────────────────────────────────────

const FREQUENCY_TABLE = [
  { metric: "National Debt", sourceFreq: "Daily", cacheTtl: "1 hour", freshness: "Near real-time", dotClass: "status-live", freshnessColor: "text-positive" },
  { metric: "TGA Balance", sourceFreq: "Daily", cacheTtl: "1 hour", freshness: "Near real-time", dotClass: "status-live", freshnessColor: "text-positive" },
  { metric: "Fed Balance Sheet", sourceFreq: "Weekly (Thu)", cacheTtl: "1 hour", freshness: "Weekly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "Reverse Repo", sourceFreq: "Daily", cacheTtl: "1 hour", freshness: "Near real-time", dotClass: "status-live", freshnessColor: "text-positive" },
  { metric: "Treasury Yields", sourceFreq: "Daily", cacheTtl: "1 hour", freshness: "Near real-time", dotClass: "status-live", freshnessColor: "text-positive" },
  { metric: "Fed Funds Rate", sourceFreq: "Monthly", cacheTtl: "1 hour", freshness: "Monthly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "Receipts & Outlays", sourceFreq: "Monthly", cacheTtl: "24 hours", freshness: "Monthly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "M2 Money Supply", sourceFreq: "Monthly", cacheTtl: "24 hours", freshness: "Monthly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "CPI / Inflation", sourceFreq: "Monthly", cacheTtl: "24 hours", freshness: "Monthly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "Debt-to-GDP", sourceFreq: "Quarterly", cacheTtl: "24 hours", freshness: "Quarterly", dotClass: "status-static", freshnessColor: "text-muted-foreground" },
  { metric: "Dollar Index (DTWEXBGS)", sourceFreq: "Weekly", cacheTtl: "5 min", freshness: "Weekly", dotClass: "status-recent", freshnessColor: "text-warning" },
  { metric: "Defense Spending (DoD)", sourceFreq: "Annual (FY)", cacheTtl: "1 hour", freshness: "Annual", dotClass: "status-static", freshnessColor: "text-muted-foreground" },
  { metric: "Foreign Assistance", sourceFreq: "Annual", cacheTtl: "1 hour", freshness: "Annual", dotClass: "status-static", freshnessColor: "text-muted-foreground" },
];

const LIMITATIONS = [
  "Government data sources may experience delays or outages. When a source is unavailable, we serve cached data and indicate staleness.",
  "The 'Debt to the Penny' series only updates on business days. Weekend and holiday values reflect the most recent business day.",
  "Monthly Treasury Statement data has a ~15 business day reporting lag. Current-month figures are not available until mid-following month.",
  "FRED series update frequencies vary. Some daily series (like yields) may have gaps on holidays or during government shutdowns.",
  "Net Liquidity is a widely-used but simplified approximation. It does not capture all factors affecting financial system liquidity.",
  "AI-generated summaries (Phase 2) will always cite specific data points. However, AI interpretations should not be treated as financial advice.",
  "Historical data depth varies by source. Some FRED series go back decades; Treasury FiscalData API coverage may be more limited.",
];
