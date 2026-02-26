// src/app/api/portfolio/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { getPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { db } from "@/lib/db/prisma";
import { addHoldingSchema } from "@/lib/validations/portfolio.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  forbiddenError,
  internalError,
  parseBody,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const portfolios = await db.portfolio.findMany({
      where: { userId: session.user.id },
      include: {
        holdings: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return apiSuccess(portfolios, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "portfolio:GET");
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const parsed = await parseBody(req, addHoldingSchema);
  if (!parsed.success) return parsed.response;
  const { symbol, quantity, avgCostBasis, notes } = parsed.data;

  try {
    // Enforce per-tier holding limit
    const permissions = getPermissions(session.user.subscriptionTier);
    const defaultPortfolio = await db.portfolio.findFirst({
      where: { userId: session.user.id, isDefault: true },
      include: { _count: { select: { holdings: true } } },
    });

    if (!defaultPortfolio) {
      return internalError(new Error("Default portfolio not found"), "portfolio:POST");
    }

    const maxItems = permissions.maxWatchlistItems;
    if (defaultPortfolio._count.holdings >= maxItems) {
      return forbiddenError(
        `Your plan allows a maximum of ${maxItems} holdings. Upgrade to add more.`
      );
    }

    // Check for duplicate symbol in this portfolio
    const existing = await db.holding.findFirst({
      where: { portfolioId: defaultPortfolio.id, symbol },
    });

    if (existing) {
      return forbiddenError(`${symbol} is already in this portfolio. Edit the existing holding instead.`);
    }

    const holding = await db.holding.create({
      data: {
        portfolioId: defaultPortfolio.id,
        symbol,
        name: symbol,
        quantity,
        avgCostBasis,
        notes: notes ?? null,
      },
    });

    return apiSuccess(holding, undefined, 201, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "portfolio:POST");
  }
}
