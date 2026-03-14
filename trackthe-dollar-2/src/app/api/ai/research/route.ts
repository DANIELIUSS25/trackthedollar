// src/app/api/ai/research/route.ts
// POST /api/ai/research — Generate a research note on a topic
// Requires PRO+ subscription. Uses Perplexity sonar-pro for deep research.

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { generateResearchNote } from "@/lib/ai/features";
import { evaluateContent, getPublicationAction } from "@/lib/ai/evaluation";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  forbiddenError,
  validationError,
  internalError,
} from "@/lib/utils/api-response";
import { getPermissions } from "@/lib/auth/permissions";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const researchSchema = z.object({
  topic: z.string().min(10).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  // Feature gate: PRO+ only (macroAccess)
  const perms = getPermissions(session.user.subscriptionTier);
  if (!perms.canAccessMacro) {
    return forbiddenError("Research notes require a Pro or Enterprise subscription.");
  }

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const body = await req.json();
    const parsed = researchSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { topic } = parsed.data;
    const result = await generateResearchNote(topic);

    const evalResult = evaluateContent(result);
    const action = getPublicationAction(evalResult);

    if (action === "reject") {
      return apiSuccess({
        content: "",
        available: false,
        reason: "Research note did not pass quality checks. Please try a more specific topic.",
      });
    }

    return apiSuccess({
      content: result.content,
      citations: result.citations,
      confidence: result.confidence,
      generatedAt: result.generatedAt,
      disclaimer: result.disclaimer,
      evalScore: evalResult.score,
    });
  } catch (err) {
    return internalError(err, "ai/research");
  }
}
