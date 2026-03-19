import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, TrendingUp, BarChart3, ExternalLink } from "lucide-react";
import { ALL_SEO_PAGES, SEO_PAGE_MAP, CATEGORY_LABELS } from "@/lib/seo/pages";
import { fetchNationalDebt, fetchInflation, fetchInterestRates, fetchDollarStrength, fetchMoneySupply, fetchGasPrice } from "@/lib/api/gov-data";
import { APP_URL } from "@/lib/utils/constants";

export const revalidate = 3600; // revalidate hourly

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return ALL_SEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = SEO_PAGE_MAP.get(params.slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${APP_URL}/topics/${page.slug}`,
      type: "article",
      siteName: "TrackTheDollar.com",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
    alternates: {
      canonical: `${APP_URL}/topics/${page.slug}`,
    },
  };
}

async function getLiveMetric(metric: string): Promise<{ label: string; value: string; sub?: string } | null> {
  try {
    if (metric === "debt") {
      const d = await fetchNationalDebt();
      if (!d.totalDebt) return null;
      const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
      return { label: "U.S. National Debt", value: fmt.format(d.totalDebt), ...(d.lastDate && { sub: `As of ${d.lastDate}` }) };
    }
    if (metric === "inflation") {
      const inf = await fetchInflation();
      if (!inf.yoyChange) return null;
      return { label: "CPI Inflation (YoY)", value: `${inf.yoyChange.toFixed(2)}%`, sub: "Bureau of Labor Statistics" };
    }
    if (metric === "rates") {
      const r = await fetchInterestRates();
      if (!r.fedFunds?.current) return null;
      return { label: "Fed Funds Rate", value: `${r.fedFunds.current.toFixed(2)}%`, sub: "Federal Reserve" };
    }
    if (metric === "dollar") {
      const d = await fetchDollarStrength();
      if (!d.current) return null;
      return { label: "U.S. Dollar Index (DXY)", value: d.current.toFixed(2), ...(d.changePercent != null && { sub: `${d.changePercent >= 0 ? "+" : ""}${d.changePercent.toFixed(2)}% change` }) };
    }
    if (metric === "m2") {
      const m = await fetchMoneySupply();
      if (!m.m2?.latest) return null;
      const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
      return { label: "M2 Money Supply", value: fmt.format(m.m2.latest * 1e9), sub: "Federal Reserve" };
    }
    if (metric === "gas") {
      const g = await fetchGasPrice();
      if (!g.price) return null;
      return { label: "Avg. U.S. Gas Price", value: `$${g.price.toFixed(2)}/gal`, sub: "EIA Weekly Data" };
    }
  } catch {}
  return null;
}

export default async function TopicPage({ params }: Props) {
  const page = SEO_PAGE_MAP.get(params.slug);
  if (!page) notFound();

  const liveMetric = await getLiveMetric(page.metric);
  const relatedPages = page.relatedSlugs.map((s) => SEO_PAGE_MAP.get(s)).filter(Boolean);

  // JSON-LD structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.description,
    url: `${APP_URL}/topics/${page.slug}`,
    dateModified: new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: "TrackTheDollar.com",
      url: APP_URL,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: CATEGORY_LABELS[page.category], item: `${APP_URL}/topics/${page.slug}` },
      { "@type": "ListItem", position: 3, name: page.h1, item: `${APP_URL}/topics/${page.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-[#09090b] text-white">
        {/* Nav */}
        <nav className="border-b border-white/10 px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="text-sm font-bold tracking-tight">
            TrackThe<span className="text-green-400">Dollar</span>.com
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition-colors"
          >
            Live Dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
            <Link href="/" className="hover:text-white/70">Home</Link>
            <span>/</span>
            <span className="capitalize">{CATEGORY_LABELS[page.category]}</span>
            <span>/</span>
            <span className="text-white/60">{page.h1}</span>
          </div>

          {/* Hero */}
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
              Live Data · {CATEGORY_LABELS[page.category]}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{page.h1}</h1>
            <p className="text-lg text-white/60 leading-relaxed">{page.intro}</p>
          </header>

          {/* Live metric card */}
          {liveMetric && (
            <div className="mb-10 p-5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{liveMetric.label}</p>
                <p className="text-3xl font-bold text-white tabular-nums">{liveMetric.value}</p>
                {liveMetric.sub && <p className="text-xs text-white/40 mt-1">{liveMetric.sub}</p>}
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-medium rounded-lg transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Full Chart
                </Link>
              </div>
            </div>
          )}

          {/* Body */}
          <section className="mb-10 prose prose-invert prose-sm max-w-none">
            <p className="text-white/70 leading-relaxed text-base">{page.body}</p>
          </section>

          {/* FAQ */}
          {page.faqs.length > 0 && (
            <section className="mb-10" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-green-400">?</span> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {page.faqs.map((faq, i) => (
                  <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/3">
                    <h3 className="font-semibold text-white mb-2 text-sm leading-snug">{faq.q}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mb-10 p-6 rounded-xl bg-gradient-to-br from-green-950/40 to-emerald-950/20 border border-green-500/20">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold mb-1">Track This Data Live on TrackTheDollar.com</h2>
                <p className="text-sm text-white/60 mb-4">
                  Get real-time charts, live counters, and the full macro dashboard — all sourced from official U.S. government APIs. No ads on the dashboard. No paywalled data.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  Open Live Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Related topics */}
          {relatedPages.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-base font-semibold text-white/60 mb-4 uppercase tracking-wider text-xs">
                Related Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedPages.map((related) => related && (
                  <Link
                    key={related.slug}
                    href={`/topics/${related.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all group"
                  >
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{related.h1}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Data source footer */}
          <footer className="mt-12 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30 flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" />
              Data sourced from U.S. Treasury Fiscal Data, Federal Reserve (FRED), Bureau of Labor Statistics, Bureau of Economic Analysis, and U.S. Energy Information Administration. Updated daily.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
