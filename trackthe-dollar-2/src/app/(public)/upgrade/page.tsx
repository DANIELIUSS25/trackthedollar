// src/app/(public)/upgrade/page.tsx
"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, Bell, ShieldOff, Zap } from "lucide-react";


const PRO_FEATURES = [
  {
    icon: Sparkles,
    title: "Unlimited TD Intelligence",
    description: "Ask as many questions as you want. No daily cap. Grounded in live U.S. government data.",
  },
  {
    icon: ShieldOff,
    title: "Ad-Free Dashboard",
    description: "Remove all ads from every page. Clean, distraction-free macro intelligence.",
  },
  {
    icon: Bell,
    title: "Email Alerts",
    description: "Get notified when national debt spikes, Fed rates change, or CPI moves. Coming soon.",
    comingSoon: true,
  },
  {
    icon: Zap,
    title: "Priority Data Refresh",
    description: "Data refreshed every 15 minutes instead of 60. Always ahead of the news.",
    comingSoon: true,
  },
];

const FREE_FEATURES = [
  "Live national debt counter",
  "Real-time KPI dashboard",
  "All chart pages (rates, inflation, money supply)",
  "5 TD Intelligence questions per day",
  "Official government data sources",
];

export default function UpgradePage() {
  // Stripe: set NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY in env to enable live checkout
  const stripeMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <Link href="/" className="text-sm font-bold">
          TrackThe<span className="text-primary">Dollar</span><span className="text-[11px] font-semibold text-primary/70">.com</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard →
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            TrackTheDollar Pro
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Unlimited fiscal intelligence
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            $1.99<span className="text-sm">/month</span> — or{" "}
            <span className="text-foreground font-medium">$19.90/year</span>{" "}
            <span className="text-xs text-primary">(save 17%)</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Cancel anytime. No commitment.</p>
        </div>

        {/* Pricing cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Free</p>
              <p className="mt-1 text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">Forever</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 block rounded-xl border border-border py-2.5 text-center text-sm font-medium text-muted-foreground hover:bg-surface-2 transition-colors"
            >
              Continue Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-6">
            <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground uppercase tracking-wide">
              Most Popular
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pro</p>
              <p className="mt-1 text-3xl font-bold">$1.99</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className={f.comingSoon ? "text-muted-foreground" : "text-foreground"}>
                    {f.title}
                    {f.comingSoon && (
                      <span className="ml-1.5 rounded-sm bg-surface-2 px-1 py-0.5 text-[10px] text-muted-foreground">Soon</span>
                    )}
                  </span>
                </li>
              ))}
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/50" />
                  {f}
                </li>
              ))}
            </ul>

            {stripeMonthlyId ? (
              <button
                onClick={() => {
                  fetch("/api/stripe/create-checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId: stripeMonthlyId }),
                  })
                    .then((r) => r.json())
                    .then((d) => d.url && (window.location.href = d.url));
                }}
                className="mt-6 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Pro — $1.99/month →
              </button>
            ) : (
              <a
                href="mailto:pro@trackthedollar.com?subject=Pro%20Membership%20Interest"
                className="mt-6 block rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Early Access →
              </a>
            )}
          </div>
        </div>

        {/* Feature breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">What you get with Pro</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {f.title}
                    {f.comingSoon && (
                      <span className="ml-2 text-xs text-muted-foreground">(coming soon)</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          All data sourced exclusively from official U.S. government agencies (Treasury, Fed, BLS, EIA).
          TrackTheDollar Pro does not provide investment advice.
        </p>
      </div>
    </div>
  );
}
