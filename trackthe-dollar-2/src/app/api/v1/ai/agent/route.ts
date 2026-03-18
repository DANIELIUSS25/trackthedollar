// src/app/api/v1/ai/agent/route.ts
// POST /api/v1/ai/agent — Public TD Intelligence Q&A (no auth required)
// Rate limited by IP: 5 questions/day. Powered by live U.S. government data.

import { type NextRequest, NextResponse } from "next/server";
import { fetchOverview } from "@/lib/api/gov-data";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = 5;

// In-memory fallback rate limiter (per process restart) when Redis unavailable
const memoryLimiter = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  // Hash to avoid storing raw IPs
  return ip.split(".").slice(0, 3).join(".") + ".0"; // /24 subnet bucket
}

async function checkLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  // Try Redis if available
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      const key = `ttd:agent:ip:${ip}`;
      const ttl = Math.floor((resetAt - now) / 1000);

      const getRes = await fetch(`${redisUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        signal: AbortSignal.timeout(2000),
      });
      const getJson = await getRes.json();
      const current = parseInt(getJson.result ?? "0", 10) || 0;

      if (current >= DAILY_LIMIT) {
        return { allowed: false, remaining: 0 };
      }

      await fetch(`${redisUrl}/set/${key}/${current + 1}/ex/${ttl}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${redisToken}` },
        signal: AbortSignal.timeout(2000),
      });

      return { allowed: true, remaining: DAILY_LIMIT - current - 1 };
    }
  } catch {
    // Fall through to memory limiter
  }

  // Memory fallback
  const entry = memoryLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    memoryLimiter.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed, remaining } = await checkLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "limit_reached", message: "Daily question limit reached. Upgrade to Pro for unlimited access.", upgradePrompt: true },
      { status: 429 }
    );
  }

  let question: string;
  try {
    const body = await req.json();
    question = typeof body.question === "string" ? body.question.trim().slice(0, 300) : "";
    if (!question || question.length < 5) {
      return NextResponse.json({ error: "invalid_question" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "service_unavailable", message: "TD Intelligence is temporarily unavailable." }, { status: 503 });
  }

  // Fetch live government data for context
  const ov = await fetchOverview().catch(() => null);
  const debt = ov?.debt;
  const rates = ov?.rates;
  const inflation = ov?.inflation;
  const money = ov?.money;

  const dataContext = [
    debt?.totalDebt ? `National Debt: $${(debt.totalDebt / 1e12).toFixed(2)}T (daily increase: +$${debt.dailyChange ? (debt.dailyChange / 1e9).toFixed(1) : "?"}B)` : null,
    inflation?.yoyChange != null ? `CPI Inflation YoY: ${inflation.yoyChange.toFixed(2)}%` : null,
    rates?.fedFunds?.current != null ? `Fed Funds Rate: ${rates.fedFunds.current.toFixed(2)}%` : null,
    rates?.treasury10Y?.current != null ? `10-Year Treasury Yield: ${rates.treasury10Y.current.toFixed(2)}%` : null,
    money?.m2?.latest != null ? `M2 Money Supply: $${(money.m2.latest / 1e3).toFixed(2)}T` : null,
    ov?.gasPrice?.price != null ? `US Avg Gas Price: $${ov.gasPrice.price.toFixed(2)}/gal` : null,
  ].filter(Boolean).join("\n");

  try {
    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You are TD Intelligence, the AI assistant for TrackTheDollar.com — the U.S. fiscal data platform. " +
              "Answer questions about how U.S. economic conditions (national debt, inflation, interest rates, dollar strength) " +
              "affect real Americans in their daily lives. " +
              "Use the provided live government data as your foundation. Be factual, concise (2-4 sentences), and relatable. " +
              "Never give investment advice. Never say 'buy', 'sell', or 'invest'. " +
              "Never mention Perplexity or any AI provider name. " +
              "Start directly with the answer — no preamble.",
          },
          {
            role: "user",
            content: `Live U.S. economic data as of today:\n${dataContext || "Data temporarily unavailable — use your knowledge."}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
        return_citations: true,
        search_recency_filter: "week",
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) throw new Error(`Perplexity ${resp.status}`);

    const json = await resp.json();
    const answer: string = json.choices?.[0]?.message?.content ?? "";
    const citations: string[] = json.citations ?? [];

    const sources = citations.slice(0, 3).map((url: string) => {
      try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
    }).filter(Boolean);

    return NextResponse.json({
      answer,
      sources: sources.length > 0 ? sources : [],
      remainingQuestions: remaining,
      upgradePrompt: remaining === 0,
    });
  } catch (e) {
    console.error("[api/v1/ai/agent]", e);
    return NextResponse.json({ error: "generation_failed", message: "TD Intelligence couldn't generate a response. Try again." }, { status: 200 });
  }
}
