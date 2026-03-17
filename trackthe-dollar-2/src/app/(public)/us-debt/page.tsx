// src/app/(public)/us-debt/page.tsx
// SEO-optimized US National Debt tracker page
import type { Metadata } from "next";
import Link from "next/link";
import { fetchNationalDebt } from "@/lib/api/gov-data";
import { LiveDebtCounter } from "@/components/shared/LiveDebtCounter";
import { ArrowRight, TrendingUp, Landmark, DollarSign, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "U.S. National Debt Live Tracker — $39 Trillion and Rising",
  description:
    "The U.S. national debt has crossed $39 trillion — an all-time high. Track it live with a real-time counter updated every second. Sourced directly from U.S. Treasury Fiscal Data.",
  keywords: [
    "US national debt",
    "national debt live",
    "national debt counter",
    "US debt clock",
    "$39 trillion",
    "national debt tracker",
    "federal debt 2026",
    "national debt per citizen",
    "us debt real time",
  ],
  openGraph: {
    title: "U.S. National Debt Live — $39 Trillion | TrackTheDollar.com",
    description:
      "The U.S. national debt has crossed $39 trillion. Track it live, updated every second from official Treasury data.",
  },
};

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export default async function USDebtPage() {
  const debt = await fetchNationalDebt();

  const totalDebtMillions = debt.totalDebt ?? 39_000_000;
  const dailyChangeMillions = debt.dailyChange ?? 4_700;
  const lastDate = debt.lastDate ?? new Date().toISOString().slice(0, 10);
  const perSecondUSD = (dailyChangeMillions * 1_000_000) / 86_400;

  const totalDebtUSD = totalDebtMillions * 1_000_000;
  const debtPerCitizen = totalDebtUSD / 334_000_000;
  const interestPerYear = totalDebtUSD * 0.0287; // ~2.87% average interest rate
  const interestPerSecond = interestPerYear / (365 * 86_400);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
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
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-negative/40 bg-negative/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-negative" />
            <span className="text-xs font-semibold uppercase tracking-widest text-negative">
              All-Time High — Live
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            U.S. National Debt
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            The United States national debt has crossed <strong className="text-negative">$39 trillion</strong> — an all-time record.
            Watch it grow in real time below.
          </p>

          {/* Live Counter */}
          <div className="mx-auto mb-4 max-w-2xl rounded-2xl border border-negative/30 bg-negative/5 p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live U.S. National Debt Counter
            </p>
            <LiveDebtCounter
              totalDebtMillions={totalDebtMillions}
              dailyChangeMillions={dailyChangeMillions}
              lastDate={lastDate}
              className="text-4xl font-black text-negative md:text-5xl lg:text-6xl"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Extrapolated in real time from U.S. Treasury Fiscal Data · Updated daily
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Growing at approximately{" "}
            <strong className="text-foreground">
              {usdCompact.format(perSecondUSD)}/second
            </strong>{" "}
            based on the latest Treasury data
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">By the Numbers</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total National Debt"
              value={usdCompact.format(totalDebtUSD)}
              sub="All-time high"
              icon={<Landmark className="h-5 w-5" />}
              color="text-negative"
              bg="bg-negative/10"
            />
            <StatCard
              label="Debt Per Citizen"
              value={usdCompact.format(debtPerCitizen)}
              sub="Based on 334M population"
              icon={<DollarSign className="h-5 w-5" />}
              color="text-primary"
              bg="bg-primary/10"
            />
            <StatCard
              label="Daily Growth"
              value={`+${usdCompact.format(dailyChangeMillions * 1_000_000)}`}
              sub="Per day (latest Treasury data)"
              icon={<TrendingUp className="h-5 w-5" />}
              color="text-negative"
              bg="bg-negative/10"
            />
            <StatCard
              label="Interest Per Second"
              value={`${usdCompact.format(interestPerSecond)}/s`}
              sub="~$1.12T+ annualized"
              icon={<Clock className="h-5 w-5" />}
              color="text-purple-400"
              bg="bg-purple-400/10"
            />
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Why $39 Trillion Matters</h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The U.S. national debt represents the total amount the federal government owes to its creditors.
              It has grown from <strong className="text-foreground">$5 trillion in 1996</strong> to over{" "}
              <strong className="text-negative">$39 trillion today</strong> — a 680% increase in under 30 years.
            </p>
            <p>
              The debt has crossed a critical milestone: annual interest payments now exceed{" "}
              <strong className="text-foreground">$1.12 trillion per year</strong>, which surpasses the entire
              U.S. defense budget. Interest is now the fastest-growing component of federal spending.
            </p>
            <p>
              At $39 trillion, the debt-to-GDP ratio exceeds <strong className="text-foreground">137%</strong>,
              surpassing the previous record set during World War II (118.9% in 1946). Unlike the post-war period,
              today&apos;s trajectory shows no sign of reversing.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/debt"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              Full Debt Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card"
            >
              All Metrics Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs text-muted-foreground">
            Data sourced from{" "}
            <a
              href="https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              U.S. Treasury Fiscal Data — Debt to the Penny
            </a>
            . Updated daily on business days. Not financial advice.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} TrackTheDollar.com
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
    </div>
  );
}
