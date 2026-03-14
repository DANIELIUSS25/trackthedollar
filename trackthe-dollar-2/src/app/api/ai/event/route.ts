// src/app/api/ai/event/route.ts
// POST /api/ai/event — Explain a fiscal/monetary event in context
// Uses Perplexity to search for coverage and provide context.

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { generateEventExplainer } from "@/lib/ai/features";
import { evaluateContent, getPublicationAction } from "@/lib/ai/evaluation";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  validationError,
  internalError,
} from "@/lib/utils/api-response";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventSchema = z.object({
  title: z.string().min(5).max(200),
  type: z.enum(["auction", "data_release", "policy", "fiscal"]),
  detail: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { title, type, detail } = parsed.data;
    const result = await generateEventExplainer({
      title,
      type,
      ...(detail !== undefined ? { detail } : {}),
    });

    const evalResult = evaluateContent(result);
    const action = getPublicationAction(evalResult);

    if (action === "reject") {
      return apiSuccess({
        explanation: "",
        available: false,
        reason: "Could not generate a reliable explanation for this event.",
      });
    }

    return apiSuccess({
      explanation: result.content,
      citations: result.citations,
      confidence: result.confidence,
      generatedAt: result.generatedAt,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    return internalError(err, "ai/event");
  }
}
