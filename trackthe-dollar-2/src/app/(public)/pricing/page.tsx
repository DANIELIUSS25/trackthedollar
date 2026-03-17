"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Star,
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Core macro intelligence — free forever",
    highlighted: false,
    features: [
      { text: "All 12 live dashboards", available: true },
      { text: "7 government data sources", available: true },
      { text: "National debt real-time tracker", available: true },
      { text: "Basic charts & time series", available: true },
      { text: "1-year historical data", available: true },
      { text: "Data refreshed every 5 minutes", available: true },
      { text: "Real-time 60s refresh", available: false },
      { text: "Full 5+ year history", available: false },
      { text: "Custom alerts", available: false },
      { text: "CSV/JSON data export", available: false },
      { text: "Ad-free experience", available: false },
    ],
    cta: "Open Dashboard",
    ctaHref: "/dashboard",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$1.99",
    period: "/month",
    description: "Full macro intelligence suite",
    highlighted: true,
    features: [
      { text: "Everything in Free", available: true },
      { text: "Real-time data (60s refresh)", available: true },
      { text: "Full historical data (5+ years)", available: true },
      { text: "Custom price & threshold alerts", available: true },
      { text: "CSV/JSON data export", available: true },
      { text: "Ad-free experience", available: true },
      { text: "Priority data delivery", available: true },
      { text: "Email alert notifications", available: true },
      { text: "Derived proxy analytics", available: true },
      { text: "Support the project", available: true },
    ],
    cta: "Get Pro",
    ctaHref: null, // triggers Stripe checkout
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "canceled">("idle");

  // Check URL params on mount
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1" && status === "idle") setStatus("success");
    if (params.get("canceled") === "1" && status === "idle") setStatus("canceled");
  }

  async function handleCheckout(planId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
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

      {/* Status banners */}
      {status === "success" && (
        <div className="border-b border-positive/30 bg-positive/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-positive">
            Welcome to Pro! Your subscription is active.
          </p>
        </div>
      )}
      {status === "canceled" && (
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-warning">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 glow-gold opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <Star className="h-3 w-3 text-primary" />
            <span className="label-md text-primary">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-display-lg font-bold tracking-tight sm:text-display-xl">
            Track Every Dollar.{" "}
            <span className="text-gradient-gold">Free or Pro.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            All core government data is free forever. Upgrade to Pro for $1.99/mo
            to unlock real-time refresh, full historical data, custom alerts,
            exports, and an ad-free experience.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-6 transition-all sm:p-8 ${
                plan.highlighted
                  ? "border-primary/40 bg-card shadow-glow"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1">
                  <span className="text-xs font-semibold text-primary-foreground">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-data text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.available ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span
                      className={`text-sm ${
                        f.available ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.ctaHref ? (
                <Link
                  href={plan.ctaHref}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-gold-500 hover:shadow-glow-strong disabled:opacity-50"
                >
                  {loading ? "Redirecting..." : plan.cta}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="border-t border-border bg-card/30 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <TrustCard
              icon={<Shield className="h-5 w-5" />}
              title="Secure Payments"
              description="Powered by Stripe. Your payment info never touches our servers."
            />
            <TrustCard
              icon={<Clock className="h-5 w-5" />}
              title="Cancel Anytime"
              description="No contracts, no commitments. Cancel your Pro subscription any time."
            />
            <TrustCard
              icon={<Zap className="h-5 w-5" />}
              title="Instant Access"
              description="Pro features activate immediately after checkout. No waiting."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-display-md font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQ
              q="Is the free tier really free?"
              a="Yes. All 12 dashboards, 7 government data sources, and core analytics are free forever with no credit card required."
            />
            <FAQ
              q="What do I get with Pro?"
              a="Pro unlocks 60-second real-time data refresh, 5+ years of historical data, custom alerts, CSV/JSON data export, ad-free browsing, and priority data delivery — all for $1.99/month."
            />
            <FAQ
              q="Can I cancel anytime?"
              a="Absolutely. Cancel from your Stripe billing portal at any time. No contracts, no cancellation fees."
            />
            <FAQ
              q="Where does the data come from?"
              a="All data comes directly from official U.S. government APIs: Treasury Fiscal Data, FRED (Federal Reserve), BLS, USAspending.gov, and USAID. No third-party intermediaries."
            />
            <FAQ
              q="Do I need to create an account?"
              a="No account needed for Free. Pro checkout is handled securely by Stripe — just enter your email and payment info."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-2xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TrackTheDollar.com. All data
            sourced from public U.S. government APIs. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-foreground">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </div>
  );
}
