// netlify/functions/daily-blog.ts
// Scheduled Netlify function — runs daily at 8:00 AM UTC.
// Calls the internal blog-generation API to create today's news post.

import type { Config } from "@netlify/functions";

export default async function handler() {
  const siteUrl = process.env.URL ?? "https://trackthedollar.com";
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiKey) {
    console.error("[daily-blog] INTERNAL_API_KEY env var is not set — skipping");
    return;
  }

  try {
    const res = await fetch(`${siteUrl}/api/admin/blog/generate`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "news" }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[daily-blog] API returned error:", res.status, data);
      return;
    }

    console.info("[daily-blog] Daily news post generated:", data);
  } catch (err) {
    console.error("[daily-blog] Fetch failed:", err);
  }
}

export const config: Config = {
  // Run every day at 08:00 UTC
  schedule: "0 8 * * *",
};
