import type { Metadata } from "next";
import { SerialDecoder } from "@/components/tools/SerialDecoder";
import Link from "next/link";
import { ArrowRight, Fingerprint, Star, Shield, Info } from "lucide-react";
import { APP_URL } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Dollar Bill Serial Number Lookup — Decode Any U.S. Currency | TrackTheDollar",
  description:
    "Decode any U.S. dollar bill serial number instantly. Identify your Federal Reserve district, check for rare star notes, and discover if you have a valuable fancy serial number like a radar, repeater, or solid note.",
  keywords: [
    "dollar bill serial number lookup",
    "star note checker",
    "fancy serial number",
    "radar note",
    "repeater note",
    "dollar bill decoder",
    "rare dollar bill serial numbers",
    "what does my dollar bill serial number mean",
  ],
  openGraph: {
    title: "Dollar Bill Serial Number Lookup",
    description:
      "Decode any U.S. dollar bill serial number. Find star notes, radar notes, and rare fancy serials.",
    url: `${APP_URL}/tools/serial-number`,
    type: "website",
    siteName: "TrackTheDollar.com",
  },
  alternates: { canonical: `${APP_URL}/tools/serial-number` },
};

const howItWorksCards = [
  {
    icon: Shield,
    title: "Federal Reserve Districts",
    description:
      "The first letter of every serial number identifies one of the 12 Federal Reserve Banks — from A (Boston) to L (San Francisco). Each district bank issues notes in its region.",
  },
  {
    icon: Star,
    title: "Star Notes",
    description:
      "Bills ending in ★ are replacement notes, printed when a regular bill is damaged during production. Star notes are rarer than standard bills and are collected as a hobby.",
  },
  {
    icon: Fingerprint,
    title: "Fancy Serial Numbers",
    description:
      "Collectors prize serials with special patterns: solids (11111111), radars (palindromes), repeaters (12341234), ladders (12345678), and ultra-low or ultra-high numbers.",
  },
] as const;

const faqs = [
  {
    q: "How do I find the serial number on a dollar bill?",
    a: "The serial number appears twice on the face of the bill — once on the left and once on the right side. It starts with a letter (A–L), followed by 8 digits, and ends with another letter or a ★ symbol for star notes.",
  },
  {
    q: "What is a star note dollar bill?",
    a: "A star note is a replacement bill printed by the Bureau of Engraving and Printing when a regular note is damaged during the printing process. Star notes have a ★ symbol instead of the final letter. They are rarer than regular bills and collected as a hobby.",
  },
  {
    q: "What makes a dollar bill serial number rare or valuable?",
    a: "Collectors prize 'fancy' serial numbers — solid notes (all same digit), radar notes (palindromes), repeater notes (first 4 digits repeat in last 4), ladder notes (12345678 or 87654321), and low serial numbers (below 100). The rarer the pattern, the higher the collector premium.",
  },
  {
    q: "Which Federal Reserve Bank issued my dollar bill?",
    a: "The first letter of your serial number identifies the issuing Federal Reserve Bank: A=Boston, B=New York, C=Philadelphia, D=Cleveland, E=Richmond, F=Atlanta, G=Chicago, H=St. Louis, I=Minneapolis, J=Kansas City, K=Dallas, L=San Francisco.",
  },
];

export default function SerialNumberPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dollar Bill Serial Number Lookup",
    description:
      "Decode any U.S. dollar bill serial number. Identify your Federal Reserve district, check for rare star notes, and discover fancy serial number patterns.",
    url: `${APP_URL}/tools/serial-number`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "TrackTheDollar.com",
      url: APP_URL,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${APP_URL}/tools` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Serial Number Lookup",
        item: `${APP_URL}/tools/serial-number`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Tools</span>
            <span>/</span>
            <span className="text-white/60">Serial Number Lookup</span>
          </div>

          {/* Hero */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="h-5 w-5 text-green-400" />
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-400">
                Free Tool · No Sign-Up Required
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Dollar Bill Serial Number Lookup
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Decode any U.S. Federal Reserve Note in seconds. Find out which Federal Reserve Bank
              issued your bill, check if you have a rare star note, and discover whether your serial
              number qualifies as a valuable fancy serial.
            </p>
          </header>

          {/* Tool */}
          <section className="mb-12" aria-label="Serial number decoder tool">
            <SerialDecoder />
          </section>

          {/* How It Works */}
          <section className="mb-10" aria-labelledby="how-it-works-heading">
            <h2
              id="how-it-works-heading"
              className="text-xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-green-400">
                <Info className="h-5 w-5 inline" />
              </span>{" "}
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {howItWorksCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="p-5 rounded-xl border border-white/10 bg-[#111] space-y-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-green-400">?</span> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-white/10 bg-[#111]">
                  <h3 className="font-semibold text-white mb-2 text-sm leading-snug">{faq.q}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-10 p-6 rounded-xl bg-gradient-to-br from-green-950/40 to-emerald-950/20 border border-green-500/20">
            <div className="flex items-start gap-4">
              <Fingerprint className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold mb-1">
                  Explore More U.S. Fiscal Data on TrackTheDollar.com
                </h2>
                <p className="text-sm text-white/60 mb-4">
                  Beyond serial numbers — track real-time national debt, Fed liquidity, inflation,
                  interest rates, and more. All sourced from official U.S. government APIs.
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

          <footer className="mt-12 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30">
              Serial number decoder for educational and collector purposes. Rarity scores are
              estimates based on collector community conventions. TrackTheDollar.com is not affiliated
              with the Bureau of Engraving and Printing or the Federal Reserve.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
