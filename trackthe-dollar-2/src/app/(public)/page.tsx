// src/app/(public)/page.tsx — Landing page for TrackTheDollar.com
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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              TrackThe<span className="text-primary">Dollar</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            Institutional-Grade Macro Intelligence
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            The U.S. Dollar System.{" "}
            <span className="text-primary">Tracked.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A premium macro intelligence platform that tracks national debt, Treasury borrowing,
            Fed liquidity operations, and fiscal flows — all in one Bloomberg-style dashboard
            built for the public internet.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              See Features
            </Link>
          </div>
        </div>
      </section>

      {/* Key Numbers Ticker */}
      <section className="border-b border-border bg-card/30 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 overflow-x-auto px-6">
          <TickerItem label="National Debt" value="$36.2T+" />
          <div className="h-4 w-px bg-border" />
          <TickerItem label="Fed Balance Sheet" value="$6.8T" />
          <div className="h-4 w-px bg-border" />
          <TickerItem label="Budget Deficit" value="$1.8T/yr" />
          <div className="h-4 w-px bg-border" />
          <TickerItem label="Interest Expense" value="$1.1T/yr" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Four Pillars of Dollar Intelligence
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every metric that matters for understanding the U.S. dollar system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FeatureCard
              icon={<Landmark className="h-6 w-6" />}
              title="National Debt"
              description="Total public debt outstanding, debt composition, growth trajectory, Treasury auction results, and debt-to-GDP ratio. Updated daily from Treasury."
              href="/debt"
              metrics={[
                "Total debt outstanding",
                "Debt held by public vs. intragovernmental",
                "Daily/monthly/yearly growth",
                "Debt-to-GDP ratio",
              ]}
            />
            <FeatureCard
              icon={<Droplets className="h-6 w-6" />}
              title="Liquidity & Fed"
              description="Fed balance sheet, Treasury General Account, reverse repo facility, and the net liquidity formula that drives markets."
              href="/liquidity"
              metrics={[
                "Net Liquidity = Fed BS − TGA − RRP",
                "Fed balance sheet (QT tracking)",
                "TGA cash balance",
                "Reverse repo facility usage",
              ]}
            />
            <FeatureCard
              icon={<Receipt className="h-6 w-6" />}
              title="Fiscal Flows"
              description="Federal receipts, outlays, budget deficit tracking, spending by category, revenue by source, and interest expense trajectory."
              href="/fiscal"
              metrics={[
                "Monthly & FYTD receipts vs. outlays",
                "Spending by category breakdown",
                "Revenue by source",
                "Interest expense growth",
              ]}
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Dollar & Markets"
              description="DXY dollar index, Treasury yields, yield curve, money supply, and inflation indicators — the market pulse of the dollar system."
              href="/markets"
              metrics={[
                "10Y & 2Y Treasury yields",
                "Yield curve spread",
                "M2 money supply",
                "Fed Funds rate & CPI",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Not Another Generic Chart Site
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DiffCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Connected Data"
              description="See how debt issuance affects the TGA, which affects liquidity, which affects markets. No other platform connects these flows."
            />
            <DiffCard
              icon={<Shield className="h-5 w-5" />}
              title="Non-Partisan & Data-Driven"
              description="No political spin. No conspiracy framing. Just structured, sourced, government data presented with institutional rigor."
            />
            <DiffCard
              icon={<Zap className="h-5 w-5" />}
              title="Premium Data Density"
              description="More information per pixel than competitors. Bloomberg-inspired dark UI with monospace financial data and professional charting."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Start Tracking the Dollar System
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Free tier includes core metrics. Pro unlocks full historical data, alerts, and
            AI-powered briefings.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Dashboard — Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">
                TrackThe<span className="text-primary">Dollar</span>.com
              </span>
            </div>
            <p className="text-2xs text-muted-foreground">
              Data from U.S. Treasury, Federal Reserve (FRED), and public government APIs.
              Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TickerItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-data text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  metrics,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  metrics: string[];
}) {
  return (
    <Link
      href={href}
      className="group panel flex flex-col p-6 transition-colors hover:border-primary/30"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-1.5">
        {metrics.map((m) => (
          <li key={m} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1 w-1 rounded-full bg-primary" />
            {m}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          Explore <ArrowRight className="h-3 w-3" />
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
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
