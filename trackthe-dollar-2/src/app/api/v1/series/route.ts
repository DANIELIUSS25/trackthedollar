// src/app/api/v1/series/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { validateApiKey, unauthorized } from "@/lib/api/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/series — List all available data series.
 * Requires a valid API key.
 */
export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth) return unauthorized();

  const series = await prisma.dataSeries.findMany({
    where: { isActive: true },
    select: {
      id: true,
      source: true,
      name: true,
      description: true,
      units: true,
      frequency: true,
    },
    orderBy: { source: "asc" },
  });

  return NextResponse.json({
    data: series,
    meta: {
      total: series.length,
      requestId: crypto.randomUUID(),
    },
  });
}
