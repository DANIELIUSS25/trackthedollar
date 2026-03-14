// src/lib/api/api-auth.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import crypto from "crypto";

/**
 * Validates an API key from the Authorization header.
 * Returns the user info and scopes if valid, or null.
 */
export async function validateApiKey(req: NextRequest): Promise<{
  userId: string;
  scopes: string[];
  tier: string;
} | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ttd_")) return null;

  const rawKey = authHeader.slice(7); // Remove "Bearer "
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: {
      user: { select: { id: true, role: true } },
    },
  });

  if (!apiKey) return null;

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return {
    userId: apiKey.user.id,
    scopes: apiKey.scopes,
    tier: apiKey.user.role,
  };
}

/**
 * Validates that the request has admin-level internal API key.
 */
export function validateInternalKey(req: NextRequest): boolean {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) return false;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${key}`;
}

/**
 * Standard error responses for API routes.
 */
export function unauthorized() {
  return NextResponse.json(
    { error: "Invalid or missing API key" },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Insufficient permissions" },
    { status: 403 }
  );
}

export function tooManyRequests() {
  return NextResponse.json(
    { error: "Rate limit exceeded. Please try again later." },
    { status: 429 }
  );
}
