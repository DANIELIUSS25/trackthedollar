// src/app/(public)/upgrade/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, Bell, ShieldOff, Zap, Mail, ArrowRight, Clock } from "lucide-react";

const PRO_FEATURES = [
  {
    icon: Sparkles,
    title: "Unlimited TD Intelligence",
    description: "Ask as many questions as you want. No daily cap. Grounded in live U.S. government data.",
    comingSoon: false,
  },
  {
    icon: ShieldOff,
    title: "Ad-Free Dashboard",
    description: "Remove all ads from every page. Clean, distraction-free macro intelligence.",
    comingSoon: false,
  },
  {
    icon: Bell,
    title: "Email Alerts",
    description: "Get notified when national debt spikes, Fed rates change, or CPI moves.",
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
  const stripeMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" /> Soon
                      </span>
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
              <div className="mt-6">
                <p className="mb-2 text-xs text-center text-muted-foreground">
                  Payments launching soon — get notified first:
                </p>
                {submitted ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    You&apos;re on the list!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? "…" : <><ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>
                )}
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon banner */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Payments & email alerts coming soon</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pro is in final prep. Enter your email above to be first to know when it&apos;s live — and lock in launch pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Email signup standalone (if no Stripe) */}
        {!stripeMonthlyId && !submitted && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Get notified when Pro launches</h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              No spam. One email when Pro goes live. Unsubscribe anytime.
            </p>
            {submitted ? (
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                You&apos;re on the list — we&apos;ll email you when Pro is live.
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-border bg-surface-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {submitting ? "Submitting…" : "Notify Me"}
                </button>
              </form>
            )}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>
        )}

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
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {f.title}
                    {f.comingSoon && (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Clock className="h-2.5 w-2.5" /> Coming Soon
                      </span>
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
