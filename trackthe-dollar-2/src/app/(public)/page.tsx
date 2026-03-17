// src/app/(public)/page.tsx — Premium landing page for TrackTheDollar.com
import Link from "next/link";
import {
  DollarSign,
  Landmark,
  Droplets,
  Receipt,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Clock,
  FileText,
  ChevronRight,
  Activity,
  Lock,
  Globe,
  Layers,
  CheckCircle2,
} from "lucide-react";

// ─── Static data (replaced by API in production) ─────────────────────────────

const TICKER_ITEMS = [
  { label: "NAT'L DEBT", value: "$39.0T", change: 7.7 },
  { label: "ALL-TIME HIGH", value: "$39T", change: 0 },
  { label: "FED BS", value: "$6.82T", change: -0.26 },
  { label: "TGA", value: "$782B", change: 3.03 },
  { label: "NET LIQ", value: "$5.89T", change: -0.49 },
  { label: "10Y", value: "4.32%", change: -0.69 },
  { label: "2Y", value: "4.15%", change: -0.24 },
  { label: "FED FUNDS", value: "4.33%", change: 0 },
  { label: "CPI", value: "2.8%", change: -3.45 },
  { label: "M2", value: "$21.67T", change: 0.41 },
  { label: "DEFICIT", value: "-$1.83T", change: -8.41 },
  { label: "DOD SPEND", value: "$886B", change: 3.2 },
  { label: "FOREIGN AID", value: "$55B", change: -12.1 },
  { label: "INTEREST", value: "$1.12T/yr", change: 4.38 },
];

const DAILY_CHANGES = [
  { metric: "National Debt", direction: "up" as const, amount: "+$4.7B", context: "Treasury issued $12B in 10Y notes; $7.3B matured", sentiment: "negative" },
  { metric: "TGA Balance", direction: "up" as const, amount: "+$23B", context: "Tax receipts + auction settlements exceeded outflows", sentiment: "neutral" },
  { metric: "Reverse Repo", direction: "down" as const, amount: "-$12B", context: "MMFs continue deploying into T-bills as facility drains", sentiment: "positive" },
  { metric: "10Y Yield", direction: "down" as const, amount: "-3 bps", context: "Flight to safety on weaker payrolls data", sentiment: "neutral" },
  { metric: "Net Liquidity", direction: "down" as const, amount: "-$29B", context: "QT + rising TGA offset by RRP drain", sentiment: "negative" },
];

const FEATURED_METRICS = [
  { label: "National Debt", value: "$39.0T", sub: "ALL-TIME HIGH — just crossed $39T", icon: Landmark, color: "text-negative", bg: "bg-negative/10" },
  { label: "Interest Per Day", value: "$3.07B", sub: "$1.12T annualized", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Debt Per Citizen", value: "$116,766", sub: "334M population", icon: DollarSign, color: "text-gold-400", bg: "bg-gold-400/10" },
  { label: "Defense Spending", value: "$886B", sub: "DoD FY2026 obligations", icon: Shield, color: "text-info", bg: "bg-info/10" },
];

const FLOW_SUMMARY = {
  inflows: [
    { label: "Individual Income Tax", value: "$2.43T", pct: 49.6, color: "#f0b429" },
    { label: "Payroll Taxes", value: "$1.68T", pct: 34.3, color: "#3b82f6" },
    { label: "Corporate Tax", value: "$420B", pct: 8.6, color: "#16c784" },
    { label: "Other Revenue", value: "$370B", pct: 7.5, color: "#6b7a99" },
  ],
  outflows: [
    { label: "Health (Medicare/Medicaid)", value: "$1.68T", pct: 26.9, color: "#ea3943" },
    { label: "Social Security", value: "$1.46T", pct: 23.4, color: "#f0b429" },
    { label: "Interest on Debt", value: "$1.12T", pct: 17.9, color: "#8b5cf6" },
    { label: "National Defense", value: "$886B", pct: 14.2, color: "#3b82f6" },
    { label: "Other", value: "$1.10T", pct: 17.6, color: "#6b7a99" },
  ],
};

const RESEARCH = [
  {
    category: "BREAKING",
    color: "text-negative",
    bg: "bg-negative/10",
    title: "National Debt Hits $39 Trillion — New All-Time High",
    summary: "The U.S. national debt has crossed $39 trillion for the first time in history. That's $116,766 per citizen, $3.07 billion in daily interest alone, and accelerating.",
    metric: "$39,000,000,000,000",
    date: "Mar 2026",
  },
  {
    category: "FISCAL",
    color: "text-positive",
    bg: "bg-positive/10",
    title: "Interest Expense Now Exceeds Defense Budget",
    summary: "Annual interest payments ($1.12T) now exceed the entire defense budget ($886B) for the first time — consuming 17.9% of all federal spending.",
    metric: "$1.12T vs $886B",
    date: "Mar 2026",
  },
  {
    category: "DEBT",
    color: "text-gold-400",
    bg: "bg-gold-400/10",
    title: "Debt-to-GDP Surpasses WWII Levels",
    summary: "At $39T, the debt-to-GDP ratio exceeds WWII peak (118.9% in 1946). Unlike the post-war period, today's trajectory is accelerating with no slowdown in sight.",
    metric: "137%+ of GDP",
    date: "Mar 2026",
  },
];

const FORECASTS = [
  { metric: "National Debt", now: "$39.0T", projected: "$42T+", horizon: "End FY2027", source: "CBO", trend: "up" as const },
  { metric: "Interest/Year", now: "$1.12T", projected: "$1.38T", horizon: "FY2027", source: "CBO", trend: "up" as const },
  { metric: "Fed Balance Sheet", now: "$6.82T", projected: "$6.2T", horizon: "End of QT", source: "FOMC", trend: "down" as const },
  { metric: "Fed Funds Rate", now: "4.33%", projected: "3.58%", horizon: "End 2026", source: "Dot Plot", trend: "down" as const },
];

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
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#flows" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Dollar Flows</Link>
            <Link href="#research" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Research</Link>
            <Link href="/methodology" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Methodology</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign In
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
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2 px-6">
                <span className="label-sm text-muted-foreground">{item.label}</span>
                <span className="font-data text-xs font-medium text-foreground">{item.value}</span>
                {item.change !== 0 && (
                  <span className={`font-data text-[10px] ${item.change > 0 ? "text-positive" : "text-negative"}`}>
                    {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="h-3 w-px bg-border" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        <div className="absolute inset-0 glow-gold" />
        <div className="absolute inset-0 bg-dots opacity-[0.02]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24">
          {/* Breaking Alert Badge */}
          <div className="mb-4 flex justify-center animate-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-negative/40 bg-negative/10 px-4 py-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-negative" />
              <span className="label-md font-semibold text-negative">U.S. NATIONAL DEBT HITS ALL-TIME HIGH: $39 TRILLION</span>
            </div>
          </div>

          <div className="mb-8 flex justify-center animate-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Zap className="h-3 w-3 text-primary" />
              <span className="label-md text-primary">7 Government Data Sources. Zero Spin. Real-Time.</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-reveal stagger-1 mx-auto max-w-4xl text-center text-display-xl font-bold tracking-tight md:text-[3.5rem] lg:text-[4rem]">
            <span className="text-negative">$39 Trillion</span> and Counting.{" "}
            <span className="text-gradient-gold">Track Every Dollar.</span>
          </h1>

          <p className="animate-reveal stagger-2 mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Real-time national debt, Fed liquidity, defense spending, inflation, interest rates,
            and foreign aid — pulled directly from official U.S. government APIs. No middlemen. No spin.
          </p>

          {/* CTAs */}
          <div className="animate-reveal stagger-3 mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-gold-500 hover:shadow-glow-strong"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card"
            >
              See What&apos;s Tracked
            </Link>
          </div>

          {/* ─── Hero Live Stats ────────────────────────────── */}
          <div className="animate-reveal stagger-4 mx-auto mt-16 max-w-5xl">
            <div className="panel-hero p-6 md:p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
                <HeroStatBlock
                  label="National Debt"
                  value="$39.0T"
                  subValue="ALL-TIME HIGH"
                  status="live"
                  statusLabel="Treasury"
                />
                <div className="hidden h-full w-px bg-border md:block" />
                <HeroStatBlock
                  label="Interest/Year"
                  value="$1.12T"
                  subValue="Now exceeds defense budget"
                  status="recent"
                  statusLabel="Treasury"
                />
                <div className="hidden h-full w-px bg-border md:block" />
                <HeroStatBlock
                  label="Defense Spending"
                  value="$886B"
                  subValue="DoD obligations FY2026"
                  status="recent"
                  statusLabel="USAspending"
                />
                <div className="hidden h-full w-px bg-border md:block" />
                <HeroStatBlock
                  label="Debt Per Citizen"
                  value="$116,766"
                  subValue="Every man, woman, child"
                  status="live"
                  statusLabel="Calculated"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Stat Cards ─────────────────────────────────── */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="panel p-5 transition-all duration-200 hover:shadow-panel-raised">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${m.bg} ${m.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="label-sm text-muted-foreground">{m.label}</p>
                      <p className="font-data text-data-lg font-bold text-foreground">{m.value}</p>
                      <p className="font-data text-2xs text-muted-foreground">{m.sub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── What Changed Today ──────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-display-md font-bold tracking-tight">What Changed Today</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Key movements across the dollar system in the last 24 hours.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {DAILY_CHANGES.map((change, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 rounded-lg border border-transparent p-4 transition-all duration-200 hover:border-border hover:bg-card/50"
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  change.sentiment === "positive" ? "bg-positive-subtle" : change.sentiment === "negative" ? "bg-negative-subtle" : "bg-muted"
                }`}>
                  {change.direction === "up" ? (
                    <ArrowUpRight className={`h-4 w-4 ${change.sentiment === "positive" ? "text-positive" : change.sentiment === "negative" ? "text-negative" : "text-muted-foreground"}`} />
                  ) : (
                    <ArrowDownRight className={`h-4 w-4 ${change.sentiment === "positive" ? "text-positive" : change.sentiment === "negative" ? "text-negative" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{change.metric}</span>{" "}
                    <span className={`font-data font-medium ${
                      change.sentiment === "positive" ? "text-positive" : change.sentiment === "negative" ? "text-negative" : "text-foreground"
                    }`}>
                      {change.amount}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{change.context}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-gold-300"
            >
              See full daily briefing
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Four Pillars ──────────────────────────────────────── */}
      <section id="features" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-display-md font-bold tracking-tight">
              7 Data Sources. 12 Dashboards. Zero Spin.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every metric that matters — pulled directly from FRED, Treasury, BLS, USAspending, and USAID.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PillarCard
              icon={<Landmark className="h-6 w-6" />}
              title="National Debt"
              description="Total public debt, composition breakdown, daily changes — direct from Treasury Fiscal Data API."
              href="/debt"
              metrics={["$39T total debt outstanding", "Debt held by public vs. intragovernmental", "Daily change tracking", "Historical time series"]}
              color="text-negative"
              bgColor="bg-negative/10"
              stat="$39.0T"
            />
            <PillarCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Interest Rates"
              description="Fed funds rate, 2Y and 10Y Treasury yields, yield curve spread — all from FRED."
              href="/rates"
              metrics={["Federal Funds effective rate", "2Y & 10Y Treasury yields", "Yield curve spread (10Y−2Y)", "Inversion detection"]}
              color="text-gold-400"
              bgColor="bg-gold-400/10"
              stat="4.33%"
            />
            <PillarCard
              icon={<Receipt className="h-6 w-6" />}
              title="Inflation"
              description="CPI All Items, Core CPI from BLS, plus 5-Year Breakeven Inflation from FRED."
              href="/inflation"
              metrics={["CPI year-over-year change", "Core CPI (ex food & energy)", "5Y breakeven inflation", "Historical CPI index"]}
              color="text-purple-400"
              bgColor="bg-purple-400/10"
              stat="CPI"
            />
            <PillarCard
              icon={<Droplets className="h-6 w-6" />}
              title="Money Supply"
              description="M2 money stock, Fed total assets (WALCL), and reserve balances — tracking monetary expansion."
              href="/money-supply"
              metrics={["M2 money supply", "Fed balance sheet (WALCL)", "Reserve balances at the Fed", "QT tracking"]}
              color="text-info"
              bgColor="bg-info/10"
              stat="$21.7T"
            />
            <PillarCard
              icon={<Shield className="h-6 w-6" />}
              title="Defense Spending"
              description="Department of Defense budgetary resources, obligations, and outlays from USAspending.gov."
              href="/defense"
              metrics={["DoD budgetary resources", "Total obligations by FY", "Total outlays", "Contract awards"]}
              color="text-positive"
              bgColor="bg-positive/10"
              stat="$886B"
            />
            <PillarCard
              icon={<Globe className="h-6 w-6" />}
              title="Foreign Assistance"
              description="U.S. foreign aid obligations and disbursements by country and sector from USAID open data."
              href="/foreign-assistance"
              metrics={["Total obligations by year", "Top recipient countries", "Disbursement tracking", "Security assistance"]}
              color="text-gold-400"
              bgColor="bg-gold-400/10"
              stat="USAID"
            />
          </div>
        </div>
      </section>

      {/* ─── Dollar Flow Visualization ────────────────────────── */}
      <section id="flows" className="relative border-b border-border py-20">
        <div className="absolute inset-0 glow-gold-center" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-display-md font-bold tracking-tight">
              Where Every Dollar Comes From — and Goes
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Annual federal revenue vs. spending. The gap is funded by new Treasury issuance, compounding the national debt.
            </p>
          </div>

          <div className="panel-hero p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Inflows */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-positive/10">
                    <ArrowUpRight className="h-4 w-4 text-positive" />
                  </div>
                  <div>
                    <p className="label-md text-muted-foreground">Revenue (Inflows)</p>
                    <p className="font-data text-sm font-semibold text-foreground">$4.90T annually</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {FLOW_SUMMARY.inflows.map((item) => (
                    <FlowBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Outflows */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-negative/10">
                    <ArrowDownRight className="h-4 w-4 text-negative" />
                  </div>
                  <div>
                    <p className="label-md text-muted-foreground">Spending (Outflows)</p>
                    <p className="font-data text-sm font-semibold text-foreground">$6.25T annually</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {FLOW_SUMMARY.outflows.map((item) => (
                    <FlowBar key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Deficit callout */}
            <div className="mt-8 rounded-lg bg-negative/5 border border-negative/10 px-5 py-4">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div>
                  <p className="text-sm font-semibold text-foreground">Annual Deficit</p>
                  <p className="text-xs text-muted-foreground">
                    Spending exceeds revenue — the gap is funded by issuing new Treasury securities.
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-data text-data-xl font-bold text-negative">-$1.83T</p>
                  <p className="text-2xs text-muted-foreground">FY2026 year-to-date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Research Summary ─────────────────────────────────── */}
      <section id="research" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-display-md font-bold tracking-tight">Research & Analysis</h2>
              <p className="mt-2 text-muted-foreground">Data-driven insights from the latest government releases.</p>
            </div>
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-gold-300 sm:flex"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {RESEARCH.map((item, i) => (
              <article
                key={i}
                className="group panel flex flex-col p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`label-sm ${item.color}`}>{item.category}</span>
                  <span className="text-2xs text-muted-foreground">{item.date}</span>
                  <span className="ml-auto rounded-md border border-border bg-surface-2 px-2 py-0.5 font-data text-2xs text-foreground">
                    {item.metric}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1 text-2xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Read analysis <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Forecast Teaser ──────────────────────────────────── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-display-md font-bold tracking-tight">Where It&apos;s Headed</h2>
            <p className="mt-3 text-muted-foreground">
              CBO and FOMC projections for key dollar system metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FORECASTS.map((f, i) => (
              <div
                key={i}
                className="panel overflow-hidden p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="label-md text-muted-foreground">{f.metric}</span>
                  {f.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-negative/60" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-positive/60" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-2xs text-muted-foreground">Current</p>
                    <p className="font-data text-sm font-semibold text-foreground">{f.now}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                  <div>
                    <p className="text-2xs text-muted-foreground">{f.horizon}</p>
                    <p className={`font-data text-sm font-semibold ${f.trend === "up" ? "text-negative" : "text-positive"}`}>
                      {f.projected}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-2">
                  <span className="text-2xs text-muted-foreground/60">Source: {f.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust / Source Strip ─────────────────────────────── */}
      <section className="border-b border-border bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 text-center">
            <p className="label-lg text-muted-foreground">Sourced from official U.S. government data</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            <DataSourceItem
              icon={<Database className="h-4 w-4" />}
              name="U.S. Treasury"
              coverage="Debt, TGA, DTS"
              frequency="Daily"
            />
            <DataSourceItem
              icon={<BarChart3 className="h-4 w-4" />}
              name="FRED"
              coverage="Rates, M2, Dollar Index"
              frequency="Daily/Weekly"
            />
            <DataSourceItem
              icon={<Receipt className="h-4 w-4" />}
              name="BLS"
              coverage="CPI, Core CPI"
              frequency="Monthly"
            />
            <DataSourceItem
              icon={<Shield className="h-4 w-4" />}
              name="USAspending"
              coverage="DoD Spending"
              frequency="Annual"
            />
            <DataSourceItem
              icon={<Globe className="h-4 w-4" />}
              name="USAID"
              coverage="Foreign Aid"
              frequency="Annual"
            />
            <DataSourceItem
              icon={<Activity className="h-4 w-4" />}
              name="Federal Reserve"
              coverage="Balance Sheet, Reserves"
              frequency="Weekly"
            />
            <DataSourceItem
              icon={<FileText className="h-4 w-4" />}
              name="CBO"
              coverage="Projections"
              frequency="Quarterly"
            />
          </div>
          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <TrustBadge icon={<Shield className="h-3.5 w-3.5" />} label="Non-Partisan" />
            <TrustBadge icon={<Lock className="h-3.5 w-3.5" />} label="No Financial Advice" />
            <TrustBadge icon={<Globe className="h-3.5 w-3.5" />} label="Open Methodology" />
            <TrustBadge icon={<Layers className="h-3.5 w-3.5" />} label="Source-Backed" />
            <TrustBadge icon={<Clock className="h-3.5 w-3.5" />} label="Real-Time Updates" />
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
              description="See how debt issuance affects the TGA, which affects liquidity, which affects markets. No other platform connects these flows."
            />
            <DiffCard
              icon={<Shield className="h-5 w-5" />}
              title="Non-Partisan & Rigorous"
              description="No political spin. Structured, sourced, government data presented with institutional rigor and full transparency."
            />
            <DiffCard
              icon={<Clock className="h-5 w-5" />}
              title="Source-Backed Trust"
              description="Every number shows its source, update frequency, and data freshness. Confidence indicators on every metric."
            />
          </div>
        </div>
      </section>

      {/* ─── Premium CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 glow-gold-bottom" />
        <div className="absolute inset-0 bg-dots opacity-[0.02]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-display-md font-bold tracking-tight">
            Start Tracking the Dollar System
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Free tier includes all core metrics and charts. Pro unlocks full historical data,
            custom alerts, and AI-powered intelligence briefings.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-gold-500 hover:shadow-glow-strong"
            >
              Open Dashboard — Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card"
            >
              View Pro Plans
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PerkItem label="No credit card required" />
            <PerkItem label="All core data free" />
            <PerkItem label="Cancel anytime" />
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <DollarSign className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold">
                  TrackThe<span className="text-primary">Dollar</span>.com
                </span>
              </div>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Institutional-grade macro intelligence for the public internet.
                Real-time data from U.S. Treasury, Federal Reserve, and public government APIs.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="label-md mb-3 text-muted-foreground">Market Intelligence</p>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/debt" className="text-xs text-muted-foreground transition-colors hover:text-foreground">National Debt</Link></li>
                <li><Link href="/dollar-strength" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Dollar Strength</Link></li>
                <li><Link href="/rates" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Interest Rates</Link></li>
                <li><Link href="/inflation" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Inflation</Link></li>
                <li><Link href="/money-supply" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Money Supply</Link></li>
                <li><Link href="/defense" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Defense Spending</Link></li>
                <li><Link href="/foreign-assistance" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Foreign Assistance</Link></li>
              </ul>
            </div>
            <div>
              <p className="label-md mb-3 text-muted-foreground">Transparency</p>
              <ul className="space-y-2">
                <li><Link href="/methodology" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Methodology</Link></li>
                <li><Link href="/source-health" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Source Health</Link></li>
                <li><Link href="/monetary-expansion" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Monetary Expansion</Link></li>
                <li><Link href="/war-spending" className="text-xs text-muted-foreground transition-colors hover:text-foreground">War Spending</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
            <span className="text-2xs text-muted-foreground">
              &copy; {new Date().getFullYear()} TrackTheDollar.com. All data sourced from public U.S. government APIs.
            </span>
            <span className="text-2xs text-muted-foreground/60">
              Not financial advice. For informational purposes only.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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
      <span className="font-data text-data-hero font-semibold text-foreground">{value}</span>
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
  stat,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  metrics: string[];
  color: string;
  bgColor: string;
  stat: string;
}) {
  return (
    <Link
      href={href}
      className="group panel flex flex-col p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
    >
      <div className="flex items-start justify-between">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${bgColor} ${color} transition-colors`}>
          {icon}
        </div>
        <span className="font-data text-lg font-bold text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60">
          {stat}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {metrics.map((m) => (
          <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className={`mt-0.5 h-3 w-3 shrink-0 ${color} opacity-60`} />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-border pt-4">
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
    <div className="panel p-5 transition-all duration-200 hover:shadow-panel-raised">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FlowBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-foreground/80">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-data text-2xs text-muted-foreground">{pct}%</span>
          <span className="font-data text-xs font-medium text-foreground">{value}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-2xs font-medium">{label}</span>
    </div>
  );
}

function PerkItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="h-3.5 w-3.5 text-positive" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
