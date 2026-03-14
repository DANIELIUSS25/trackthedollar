// src/lib/ai/evaluation.ts
// QA and evaluation framework for AI-generated content.
// Runs automated checks before content is published to users.

import { TRUSTED_DOMAINS } from "./perplexity-client";
import type { AIGenerationResult, EvalResult, DataContext, ConfidenceLevel } from "./types";

// ─── Evaluation Criteria ─────────────────────────────────────────────────────

/**
 * Run all evaluation checks on an AI generation result.
 * Returns a scored evaluation that determines if content should be published.
 *
 * Scoring:
 *   90-100: Auto-publish (high confidence, all checks pass)
 *   70-89:  Publish with disclaimer
 *   50-69:  Flag for human review
 *   0-49:   Reject — do not publish
 */
export function evaluateContent(
  result: AIGenerationResult,
  dataContext?: DataContext
): EvalResult {
  const criteria: EvalResult["criteria"] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Citation quality (weight: 0.25)
  const citationCheck = checkCitationQuality(result);
  criteria.push(citationCheck);
  totalScore += citationCheck.pass ? 25 : 5;
  totalWeight += 25;

  // 2. No financial advice (weight: 0.20)
  const adviceCheck = checkNoFinancialAdvice(result.content);
  criteria.push(adviceCheck);
  totalScore += adviceCheck.pass ? 20 : 0; // Hard fail — 0 points if advice detected
  totalWeight += 20;

  // 3. Numerical accuracy (weight: 0.25)
  const numericCheck = dataContext
    ? checkNumericalAccuracy(result.content, dataContext)
    : { criterion: "numerical_accuracy", pass: true, notes: "No data context to validate against" };
  criteria.push(numericCheck);
  totalScore += numericCheck.pass ? 25 : 8;
  totalWeight += 25;

  // 4. Content relevance (weight: 0.15)
  const relevanceCheck = checkContentRelevance(result);
  criteria.push(relevanceCheck);
  totalScore += relevanceCheck.pass ? 15 : 5;
  totalWeight += 15;

  // 5. Length appropriateness (weight: 0.10)
  const lengthCheck = checkLength(result);
  criteria.push(lengthCheck);
  totalScore += lengthCheck.pass ? 10 : 3;
  totalWeight += 10;

  // 6. No hallucinated events (weight: 0.05)
  const hallucinationCheck = checkNoHallucinatedEvents(result.content);
  criteria.push(hallucinationCheck);
  totalScore += hallucinationCheck.pass ? 5 : 0;
  totalWeight += 5;

  const score = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

  return {
    feature: result.feature,
    score,
    criteria,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Determine publication action based on eval score.
 */
export function getPublicationAction(
  evalResult: EvalResult
): "publish" | "publish_with_disclaimer" | "review" | "reject" {
  if (evalResult.score >= 90) return "publish";
  if (evalResult.score >= 70) return "publish_with_disclaimer";
  if (evalResult.score >= 50) return "review";
  return "reject";
}

// ─── Individual Checks ───────────────────────────────────────────────────────

function checkCitationQuality(result: AIGenerationResult): EvalResult["criteria"][0] {
  const { citations } = result;

  if (citations.length === 0 && result.provider === "perplexity") {
    return {
      criterion: "citation_quality",
      pass: false,
      notes: "No citations returned from Perplexity — content may be ungrounded",
    };
  }

  const trustedCount = citations.filter((c) =>
    TRUSTED_DOMAINS.some((d) => c.includes(d))
  ).length;

  const trustedRatio = citations.length > 0 ? trustedCount / citations.length : 0;

  if (trustedRatio >= 0.5 || trustedCount >= 2) {
    return {
      criterion: "citation_quality",
      pass: true,
      notes: `${trustedCount}/${citations.length} citations from trusted domains`,
    };
  }

  return {
    criterion: "citation_quality",
    pass: false,
    notes: `Only ${trustedCount}/${citations.length} citations from trusted domains (need ≥50% or ≥2)`,
  };
}

function checkNoFinancialAdvice(content: string): EvalResult["criteria"][0] {
  const advicePatterns = [
    /\b(you should|we recommend|consider (buying|selling|investing))\b/i,
    /\b(I (suggest|recommend|advise))\b/i,
    /\b(buy|sell|short|long)\s+(this|the|these)\b/i,
    /\b(great opportunity|strong buy|undervalued|overvalued)\b/i,
    /\b(portfolio allocation|asset allocation|rebalance)\b/i,
    /\b(price target|expected to reach|will rise to|will fall to)\b/i,
  ];

  const violations = advicePatterns.filter((p) => p.test(content));

  if (violations.length === 0) {
    return {
      criterion: "no_financial_advice",
      pass: true,
      notes: "No financial advice patterns detected",
    };
  }

  return {
    criterion: "no_financial_advice",
    pass: false,
    notes: `Detected ${violations.length} financial advice pattern(s) in content`,
  };
}

function checkNumericalAccuracy(
  content: string,
  dataContext: DataContext
): EvalResult["criteria"][0] {
  const issues: string[] = [];

  // Extract numbers from content and cross-check against data context
  const knownValues: Array<{ key: string; value: number; label: string }> = [];

  if (dataContext.totalDebt !== undefined) {
    knownValues.push({ key: "totalDebt", value: dataContext.totalDebt, label: "Total Debt" });
  }
  if (dataContext.fedBalanceSheet !== undefined) {
    knownValues.push({ key: "fedBS", value: dataContext.fedBalanceSheet, label: "Fed BS" });
  }
  if (dataContext.tgaBalance !== undefined) {
    knownValues.push({ key: "tga", value: dataContext.tgaBalance, label: "TGA" });
  }
  if (dataContext.netLiquidity !== undefined) {
    knownValues.push({ key: "netLiq", value: dataContext.netLiquidity, label: "Net Liquidity" });
  }

  // Look for dollar amounts in content
  const dollarPattern = /\$([\d,.]+)\s*([TBMK])/gi;
  let match;
  while ((match = dollarPattern.exec(content)) !== null) {
    const num = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2].toUpperCase();
    const multipliers: Record<string, number> = { T: 1e12, B: 1e9, M: 1e6, K: 1e3 };
    const parsedValue = num * (multipliers[suffix] ?? 1);

    // Check against known values
    for (const known of knownValues) {
      const ratio = parsedValue / known.value;
      if (ratio > 0.8 && ratio < 1.2 && Math.abs(ratio - 1) > 0.05) {
        issues.push(
          `${known.label}: AI says $${match[0]}, official data is ${formatForCheck(known.value)}`
        );
      }
    }
  }

  // Check percentage values
  if (dataContext.fedFundsRate !== undefined) {
    const ratePattern = new RegExp(`(\\d+\\.\\d+)%.*(?:fed\\s*funds|federal\\s*funds)`, "gi");
    const rateMatch = ratePattern.exec(content);
    if (rateMatch) {
      const stated = parseFloat(rateMatch[1]);
      if (Math.abs(stated - dataContext.fedFundsRate) > 0.1) {
        issues.push(
          `Fed Funds: AI says ${stated}%, official data is ${dataContext.fedFundsRate}%`
        );
      }
    }
  }

  if (issues.length === 0) {
    return {
      criterion: "numerical_accuracy",
      pass: true,
      notes: "All verifiable numbers consistent with official data",
    };
  }

  return {
    criterion: "numerical_accuracy",
    pass: false,
    notes: `Numerical discrepancies found: ${issues.join("; ")}`,
  };
}

function checkContentRelevance(result: AIGenerationResult): EvalResult["criteria"][0] {
  const { content, feature } = result;
  const lower = content.toLowerCase();

  // Content should mention at least one relevant topic
  const relevantTerms = [
    "debt", "treasury", "federal", "deficit", "liquidity",
    "fed", "balance sheet", "tga", "reverse repo", "rrp",
    "yield", "rate", "fiscal", "spending", "revenue",
    "m2", "money supply", "cpi", "inflation", "auction",
  ];

  const matchCount = relevantTerms.filter((term) => lower.includes(term)).length;

  if (matchCount >= 3) {
    return {
      criterion: "content_relevance",
      pass: true,
      notes: `Content mentions ${matchCount} relevant fiscal/monetary terms`,
    };
  }

  return {
    criterion: "content_relevance",
    pass: false,
    notes: `Content only mentions ${matchCount} relevant terms (need ≥3). May be off-topic for ${feature}.`,
  };
}

function checkLength(result: AIGenerationResult): EvalResult["criteria"][0] {
  const { content, feature } = result;
  const wordCount = content.split(/\s+/).length;

  const limits: Record<string, { min: number; max: number }> = {
    daily_narrative: { min: 100, max: 500 },
    what_changed_why: { min: 30, max: 250 },
    research_note: { min: 200, max: 800 },
    event_explainer: { min: 50, max: 300 },
    widget_summary: { min: 15, max: 80 },
    user_qa: { min: 30, max: 400 },
    daily_briefing: { min: 100, max: 300 },
    metric_explainer: { min: 50, max: 200 },
    alert_context: { min: 10, max: 60 },
  };

  const limit = limits[feature] ?? { min: 20, max: 500 };

  if (wordCount >= limit.min && wordCount <= limit.max) {
    return {
      criterion: "length_appropriate",
      pass: true,
      notes: `${wordCount} words (range: ${limit.min}-${limit.max})`,
    };
  }

  return {
    criterion: "length_appropriate",
    pass: false,
    notes: `${wordCount} words outside range ${limit.min}-${limit.max} for ${feature}`,
  };
}

function checkNoHallucinatedEvents(content: string): EvalResult["criteria"][0] {
  // Check for future dates that shouldn't be stated as fact
  const futurePattern = /(?:on|in|by)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20(?:2[7-9]|[3-9]\d)/gi;
  const matches = content.match(futurePattern) ?? [];

  // Check for fabricated meetings/events
  const fabricationPatterns = [
    /(?:announced|decided|voted)\s+(?:today|yesterday|this\s+(?:morning|afternoon))/gi,
    /(?:emergency|surprise|unscheduled)\s+(?:meeting|session|decision)/gi,
  ];

  const fabrications = fabricationPatterns.filter((p) => p.test(content));

  if (matches.length === 0 && fabrications.length === 0) {
    return {
      criterion: "no_hallucinated_events",
      pass: true,
      notes: "No suspicious future dates or fabricated events detected",
    };
  }

  return {
    criterion: "no_hallucinated_events",
    pass: false,
    notes: `Potential hallucination: ${matches.length} future date references, ${fabrications.length} suspicious event claims`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatForCheck(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}

// ─── Confidence Mapping ──────────────────────────────────────────────────────

/**
 * Map evaluation score to confidence level for display.
 */
export function scoreToConfidence(score: number): ConfidenceLevel {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
  if (score >= 50) return "low";
  return "none";
}
