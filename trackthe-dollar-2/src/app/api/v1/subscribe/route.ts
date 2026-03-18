// src/app/api/v1/subscribe/route.ts
// POST /api/v1/subscribe — Collect email signups for Pro launch
// Stored privately in Netlify Blobs — only accessible via your Netlify account.

import { type NextRequest } from "next/server";
import { apiSuccess, validationError, internalError } from "@/lib/utils/api-response";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { email } = parsed.data;

    // Store in Netlify Blobs — private, only readable via Netlify dashboard / CLI
    // Falls back to console log in local dev (Blobs requires Netlify context)
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore({ name: "pro-signups", consistency: "strong" });

      // Key = sanitized email, value = timestamp + metadata
      const key = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
      const existing = await store.get(key);
      if (!existing) {
        await store.set(key, JSON.stringify({
          email,
          signedUpAt: new Date().toISOString(),
          source: "upgrade-page",
        }));
      }
    } catch {
      // Netlify Blobs not available locally — log for dev visibility
      console.log(`[subscribe] Email captured: ${email}`);
    }

    return apiSuccess({ message: "You're on the list! We'll notify you when Pro launches." });
  } catch (err) {
    return internalError(err, "subscribe");
  }
}
