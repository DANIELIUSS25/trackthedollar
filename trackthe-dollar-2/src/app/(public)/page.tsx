// src/app/(public)/page.tsx — Premium landing page for TrackTheDollar.com
import Link from "next/link";
import {
  DollarSign,
  Landmark,
  Droplets,
  Receipt,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Database,
  Clock,
  FileText,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Sticky Nav ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow">
              <DollarSign className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              TrackThe<span className="text-primary">Dollar</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/methodology"
              className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Methodology
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Ticker Strip ──────────────────────────────────────── */}
      <div className="ticker-container mask-fade-x border-b border-border bg-card/40">
        <div className="ticker-track flex items-center whitespace-nowrap py-2.5">
          {TICKER_ITEMS.map((item, i) => (
            <div key={`a-${i}`} className="flex items-center">
              <div className="flex items-center gap-2 px-6">
                <span className="label-sm text-muted-foreground">{item.label}</span>
                <span className="font-data text-xs font-medium text-foreground">{item.value}</span>
              </div>
              <div className="h-3 w-px bg-border" />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {TICKER_ITEMS.map((item, i) => (
            <div key={`b-${i}`} className="flex items-center">
              <div className="flex items-center gap-2 px-6">
                <span className="label-sm text-muted-foreground">{item.label}</span>
                <span className="font-data text-xs font-medium text-foreground">{item.value}</span>
              </div>
              <div className="h-3 w-px bg-border" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        {/* Gold radial glow */}
        <div className="absolute inset-0 glow-gold" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Zap className="h-3 w-3 text-primary" />
              <span className="label-md text-primary">Institutional-Grade Macro Intelligence</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-center text-display-xl font-bold tracking-tight md:text-[3.5rem] lg:text-[4rem]">
            The U.S. Dollar System.{" "}
            <span className="text-primary">Tracked.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Real-time national debt, Treasury operations, Fed liquidity, and fiscal flows
            — structured and contextualized in one premium dashboard built for the public internet.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-gold-500 hover:shadow-glow-strong"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#pillars"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card"
            >
              See Features
            </Link>
          </div>

          {/* ─── Hero Stats ──────────────────────────────────── */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="panel-hero p-6 md:p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <HeroStatBlock
                  label="National Debt"
                  value="$36.2T+"
                  subValue="+$4.7B today"
                  status="live"
                  statusLabel="Treasury"
                />
                <div className="hidden h-full w-px bg-border md:block" />
                <HeroStatBlock
                  label="Net Liquidity"
                  value="$5.89T"
                  subValue="Fed BS − TGA − RRP"
                  status="recent"
                  statusLabel="FRED"
                />
                <div className="hidden h-full w-px bg-border md:block" />
                <HeroStatBlock
                  label="Annual Deficit"
                  value="-$1.83T"
                  subValue="FY2026 Year-to-Date"
                  status="recent"
                  statusLabel="FiscalData"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Data Sources Bar ──────────────────────────────────── */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DataSourceItem
              icon={<Database className="h-4 w-4" />}
              name="U.S. Treasury"
              coverage="National Debt, Auctions"
              frequency="Daily"
            />
            <DataSourceItem
              icon={<BarChart3 className="h-4 w-4" />}
              name="Federal Reserve (FRED)"
              coverage="Fed Operations, Rates"
              frequency="Weekly"
            />
            <DataSourceItem
              icon={<Receipt className="h-4 w-4" />}
              name="FiscalData.gov"
              coverage="Receipts, Outlays, TGA"
              frequency="Monthly"
            />
            <DataSourceItem
              icon={<FileText className="h-4 w-4" />}
              name="Congressional Budget Office"
              coverage="Projections"
              frequency="Quarterly"
            />
          </div>
        </div>
      </section>

      {/* ─── Four Pillars ──────────────────────────────────────── */}
      <section id="pillars" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-display-md font-bold tracking-tight">
              Four Pillars of Dollar Intelligence
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every metric that matters for understanding how dollars flow through the system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PillarCard
              icon={<Landmark className="h-6 w-6" />}
              title="National Debt"
              description="Total public debt outstanding, debt composition, growth trajectory, Treasury auction results, and debt-to-GDP ratio."
              href="/debt"
              metrics={[
                "Total debt outstanding",
                "Debt held by public vs. intragovernmental",
                "Daily / monthly / yearly growth rate",
                "Debt-to-GDP ratio",
              ]}
              color="text-gold-400"
              bgColor="bg-gold-400/10"
            />
            <PillarCard
              icon={<Droplets className="h-6 w-6" />}
              title="Liquidity & Fed"
              description="Fed balance sheet, Treasury General Account, reverse repo facility, and the net liquidity formula that drives markets."
              href="/liquidity"
              metrics={[
                "Net Liquidity = Fed BS − TGA − RRP",
                "Quantitative Tightening pace",
                "TGA cash balance",
                "Reverse repo facility drainage",
              ]}
              color="text-info"
              bgColor="bg-info/10"
            />
            <PillarCard
              icon={<Receipt className="h-6 w-6" />}
              title="Fiscal Flows"
              description="Federal receipts, outlays, budget deficit tracking, spending by category, revenue sources, and interest expense trajectory."
              href="/fiscal"
              metrics={[
                "Monthly & FYTD receipts vs. outlays",
                "Spending by category breakdown",
                "Revenue by source (individual, corporate)",
                "Interest expense trajectory",
              ]}
              color="text-positive"
              bgColor="bg-positive/10"
            />
            <PillarCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Dollar & Markets"
              description="Treasury yields, yield curve dynamics, money supply, inflation indicators, and the market pulse of the dollar system."
              href="/markets"
              metrics={[
                "10Y & 2Y Treasury yields",
                "Yield curve spread (10Y−2Y)",
                "M2 money supply",
                "Fed Funds rate & CPI",
              ]}
              color="text-purple-400"
              bgColor="bg-purple-400/10"
            />
          </div>
        </div>
      </section>

      {/* ─── Differentiators ───────────────────────────────────── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-display-md font-bold tracking-tight">
              Not Another Generic Chart Site
            </h2>
            <p className="mt-3 text-muted-foreground">
              Purpose-built for the dollar system. Every design decision serves the data.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DiffCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Connected Data"
              description="See how debt issuance affects the TGA, which affects liquidity, which affects markets. No other platform connects these flows in a single view."
            />
            <DiffCard
              icon={<Shield className="h-5 w-5" />}
              title="Non-Partisan & Data-Driven"
              description="No political spin. No conspiracy framing. Structured, sourced, government data presented with institutional rigor and full transparency."
            />
            <DiffCard
              icon={<Clock className="h-5 w-5" />}
              title="Source-Backed Trust"
              description="Every number shows its source, update frequency, and data freshness. Confidence indicators on every metric. Full methodology documentation."
            />
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 glow-gold-bottom" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-display-md font-bold tracking-tight">
            Start Tracking the Dollar System
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Free tier includes all core metrics and charts. Pro unlocks full historical data,
            custom alerts, and AI-powered intelligence briefings.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-gold-500 hover:shadow-glow-strong"
            >
              Open Dashboard — Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <DollarSign className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">
                TrackThe<span className="text-primary">Dollar</span>.com
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/methodology"
                className="text-2xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Methodology
              </Link>
              <span className="text-2xs text-muted-foreground">
                Data from U.S. Treasury, Federal Reserve, and public government APIs. Not financial advice.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Static ticker data (replaced by API in production) ────────

const TICKER_ITEMS = [
  { label: "NAT'L DEBT", value: "$36.218T" },
  { label: "FED BS", value: "$6.82T" },
  { label: "TGA", value: "$782B" },
  { label: "RRP", value: "$147B" },
  { label: "NET LIQ", value: "$5.89T" },
  { label: "10Y", value: "4.32%" },
  { label: "2Y", value: "4.15%" },
  { label: "FED FUNDS", value: "4.33%" },
  { label: "DEFICIT/YR", value: "-$1.83T" },
];

// ─── Sub-components ────────────────────────────────────────────

function HeroStatBlock({
  label,
  value,
  subValue,
  status,
  statusLabel,
}: {
  label: string;
  value: string;
  subValue: string;
  status: "live" | "recent";
  statusLabel: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="label-md mb-2 text-muted-foreground">{label}</span>
      <span className="font-data text-data-hero font-semibold text-foreground">
        {value}
      </span>
      <span className="mt-1.5 font-data text-xs text-muted-foreground">{subValue}</span>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={status === "live" ? "status-live" : "status-recent"} />
        <span className="label-sm text-muted-foreground">{statusLabel}</span>
      </div>
    </div>
  );
}

function DataSourceItem({
  icon,
  name,
  coverage,
  frequency,
}: {
  icon: React.ReactNode;
  name: string;
  coverage: string;
  frequency: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-card/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p className="text-2xs text-muted-foreground">{coverage}</p>
        <p className="mt-0.5 text-2xs text-muted-foreground/60">{frequency}</p>
      </div>
    </div>
  );
}

function PillarCard({
  icon,
  title,
  description,
  href,
  metrics,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  metrics: string[];
  color: string;
  bgColor: string;
}) {
  return (
    <Link
      href={href}
      className="group panel flex flex-col p-6 transition-all duration-standard hover:border-primary/20 hover:shadow-panel-raised"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${bgColor} ${color} transition-colors`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {metrics.map((m) => (
          <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
            <div className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${bgColor.replace("/10", "")}`} />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors group-hover:text-gold-300">
          Explore
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function DiffCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
