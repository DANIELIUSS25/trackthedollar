// src/app/api/v1/snapshots/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { validateApiKey, unauthorized } from "@/lib/api/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/snapshots — Get daily snapshots.
 * Query params:
 *   - latest=true (returns only the most recent)
 *   - from=YYYY-MM-DD
 *   - to=YYYY-MM-DD
 *   - limit=N (default 30, max 365)
 */
export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth) return unauthorized();

  const { searchParams } = new URL(req.url);
  const isLatest = searchParams.get("latest") === "true";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 365);

  if (isLatest) {
    const snapshot = await prisma.dailySnapshot.findFirst({
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      data: snapshot ? formatSnapshot(snapshot) : null,
      meta: {
        source: "TrackTheDollar daily snapshot",
        requestId: crypto.randomUUID(),
      },
    });
  }

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const snapshots = await prisma.dailySnapshot.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({
    data: snapshots.map(formatSnapshot),
    meta: {
      total: snapshots.length,
      requestId: crypto.randomUUID(),
    },
    pagination: {
      limit,
      hasMore: snapshots.length === limit,
    },
  });
}

function formatSnapshot(s: {
  date: Date;
  totalDebt: { toNumber(): number } | null;
  debtHeldByPublic: { toNumber(): number } | null;
  intragovHoldings: { toNumber(): number } | null;
  tgaBalance: { toNumber(): number } | null;
  fedBalanceSheet: { toNumber(): number } | null;
  rrpBalance: { toNumber(): number } | null;
  netLiquidity: { toNumber(): number } | null;
  fedFundsRate: { toNumber(): number } | null;
  dgs10: { toNumber(): number } | null;
  dgs2: { toNumber(): number } | null;
  yieldCurve: { toNumber(): number } | null;
  m2: { toNumber(): number } | null;
  cpi: { toNumber(): number } | null;
}) {
  return {
    date: s.date.toISOString().split("T")[0],
    totalDebt: s.totalDebt?.toNumber() ?? null,
    debtHeldByPublic: s.debtHeldByPublic?.toNumber() ?? null,
    intragovHoldings: s.intragovHoldings?.toNumber() ?? null,
    tgaBalance: s.tgaBalance?.toNumber() ?? null,
    fedBalanceSheet: s.fedBalanceSheet?.toNumber() ?? null,
    rrpBalance: s.rrpBalance?.toNumber() ?? null,
    netLiquidity: s.netLiquidity?.toNumber() ?? null,
    fedFundsRate: s.fedFundsRate?.toNumber() ?? null,
    dgs10: s.dgs10?.toNumber() ?? null,
    dgs2: s.dgs2?.toNumber() ?? null,
    yieldCurve: s.yieldCurve?.toNumber() ?? null,
    m2: s.m2?.toNumber() ?? null,
    cpi: s.cpi?.toNumber() ?? null,
  };
}
