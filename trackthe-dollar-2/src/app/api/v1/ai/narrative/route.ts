// src/app/api/v1/ai/narrative/route.ts
// Daily fiscal briefing powered by Perplexity sonar-pro with web citations.
// Falls back gracefully when PERPLEXITY_API_KEY is not configured.

import { NextResponse } from "next/server";
import { fetchOverview } from "@/lib/api/gov-data";

export const revalidate = 3600; // Re-generate at most once per hour

export async function GET() {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        data: null,
        error: "PERPLEXITY_API_KEY not configured",
      });
    }

    // Fetch live government data to ground the AI response in real numbers
    const overview = await fetchOverview();
    const { debt, rates, inflation, money } = overview;

    const debtT = debt.totalDebt ? `$${(debt.totalDebt / 1e12).toFixed(2)}T` : "unknown";
    const dailyChangeB = debt.dailyChange ? `+$${(debt.dailyChange / 1e9).toFixed(1)}B` : "unknown";
    const cpiYoy = inflation.yoyChange ? `${inflation.yoyChange.toFixed(2)}%` : "unavailable";
    const fedFunds = rates.fedFunds?.current ? `${rates.fedFunds.current.toFixed(2)}%` : "unavailable";
    const t10y = rates.treasury10Y?.current ? `${rates.treasury10Y.current.toFixed(2)}%` : "unavailable";
    const m2 = money.m2?.latest ? `$${(money.m2.latest / 1e12).toFixed(2)}T` : "unavailable";
    const fedBS = money.fedTotalAssets?.latest ? `$${(money.fedTotalAssets.latest / 1e12).toFixed(2)}T` : "unavailable";

    const dataContext = `Official U.S. government data as of ${debt.lastDate ?? "today"}:
- National Debt: ${debtT} (daily increase: ${dailyChangeB})
- CPI Inflation YoY: ${cpiYoy}
- Fed Funds Rate: ${fedFunds}
- 10-Year Treasury: ${t10y}
- M2 Money Supply: ${m2}
- Fed Balance Sheet: ${fedBS}`;

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a factual U.S. fiscal and monetary policy analyst for TrackTheDollar.com. " +
              "Write a concise 3–4 sentence daily briefing summarizing the most important U.S. economic and fiscal developments today. " +
              "Use the provided official data as your anchor. Reference today's news for context. " +
              "Be factual and precise. Never give investment advice. Never use the words 'buy', 'sell', or 'invest'. " +
              "Start directly with the content — no preamble.",
          },
          {
            role: "user",
            content: `${dataContext}\n\nWrite today's U.S. fiscal briefing.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
        return_citations: true,
        search_recency_filter: "day",
        search_domain_filter: [
          "treasury.gov",
          "federalreserve.gov",
          "fred.stlouisfed.org",
          "bls.gov",
          "cbo.gov",
          "reuters.com",
          "bloomberg.com",
          "wsj.com",
          "ft.com",
          "apnews.com",
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Perplexity ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const json = await resp.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    const citations: string[] = json.citations ?? [];

    // Clean up citation source labels (hostname only)
    const sources = citations
      .slice(0, 5)
      .map((url: string) => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch {
          return url;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      data: {
        title: "Daily Fiscal Briefing — Perplexity AI",
        summary: content,
        sources: sources.length > 0 ? sources : ["perplexity.ai"],
        generatedAt: new Date().toISOString(),
        model: "sonar-pro",
      },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (e) {
    console.error("[api/v1/ai/narrative]", e);
    return NextResponse.json(
      { data: null, error: String(e) },
      { status: 200 } // 200 so dashboard handles fallback gracefully
    );
  }
}
