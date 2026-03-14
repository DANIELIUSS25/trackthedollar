// src/app/api/admin/ingestion/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ingestion — List recent ingestion logs.
 * Requires ADMIN role.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const status = searchParams.get("status"); // "success" | "failed" | "running"

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const logs = await prisma.ingestionLog.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      jobName: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      duration: true,
      recordsIn: true,
      recordsOut: true,
      error: true,
    },
  });

  // Get last successful run per job
  const jobNames = [...new Set(logs.map((l) => l.jobName))];
  const lastSuccess: Record<string, Date | null> = {};

  for (const job of jobNames) {
    const last = await prisma.ingestionLog.findFirst({
      where: { jobName: job, status: "success" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    });
    lastSuccess[job] = last?.finishedAt ?? null;
  }

  return NextResponse.json({
    logs,
    lastSuccess,
    meta: {
      total: logs.length,
      timestamp: new Date().toISOString(),
    },
  });
}
