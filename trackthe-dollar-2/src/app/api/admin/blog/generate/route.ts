// src/app/api/admin/blog/generate/route.ts
// Admin endpoint to trigger blog post generation via Perplexity.
// Secured by INTERNAL_API_KEY. Can be called by cron, CI, or manually.
//
// POST /api/admin/blog/generate
// Body: { type: "news" | "education" | "single", topic?: string, category?: BlogCategory, slug?: string }

import { NextRequest, NextResponse } from "next/server";
import {
  generateAndSaveBlogPost,
  generateDailyNewsBlogPost,
  seedEducationalPosts,
} from "@/lib/blog/generator";
import type { BlogCategory } from "@prisma/client";

function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.INTERNAL_API_KEY;
  return !!expected && key === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: "news" | "education" | "single";
    topic?: string;
    category?: BlogCategory;
    slug?: string;
    maxNew?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type = "news", topic, category, slug, maxNew = 3 } = body;

  try {
    if (type === "news") {
      // Generate today's automated news post
      const generatedSlug = await generateDailyNewsBlogPost();
      return NextResponse.json({
        ok: true,
        type: "news",
        slug: generatedSlug,
        generated: generatedSlug !== null,
      });
    }

    if (type === "education") {
      // Seed up to maxNew educational posts that don't exist yet
      const slugs = await seedEducationalPosts(maxNew);
      return NextResponse.json({
        ok: true,
        type: "education",
        created: slugs.length,
        slugs,
      });
    }

    if (type === "single") {
      if (!topic || !category) {
        return NextResponse.json(
          { error: "topic and category are required for type=single" },
          { status: 400 }
        );
      }

      const validCategories: BlogCategory[] = ["NEWS", "EDUCATION", "ANALYSIS", "TOOLS"];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
      }

      const result = await generateAndSaveBlogPost({
        topic,
        category,
        forceSlug: slug,
        searchRecency: category === "NEWS" ? "week" : undefined,
        force: true,
      });

      return NextResponse.json({ ok: true, type: "single", ...result });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[blog/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
