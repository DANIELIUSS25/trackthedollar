// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { redis } from "@/lib/redis/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version: string;
  services: {
    database: "ok" | "error";
    redis: "ok" | "error";
  };
  latencyMs: {
    database: number | null;
    redis: number | null;
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const start = Date.now();

  let dbStatus: "ok" | "error" = "error";
  let dbLatency: number | null = null;

  let redisStatus: "ok" | "error" = "error";
  let redisLatency: number | null = null;

  await Promise.allSettled([
    (async () => {
      const t0 = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t0;
      dbStatus = "ok";
    })(),
    (async () => {
      const t0 = Date.now();
      await redis.ping();
      redisLatency = Date.now() - t0;
      redisStatus = "ok";
    })(),
  ]);

  const allOk = dbStatus === "ok" && redisStatus === "ok";
  const httpStatus = allOk ? 200 : 503;
  const overallStatus = allOk
    ? "ok"
    : dbStatus === "error" && redisStatus === "error"
      ? "down"
      : "degraded";

  void start; // suppress unused var

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.0.0",
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      latencyMs: {
        database: dbLatency,
        redis: redisLatency,
      },
    },
    { status: httpStatus }
  );
}
