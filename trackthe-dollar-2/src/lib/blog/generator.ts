// src/lib/blog/generator.ts
// Generates SEO-optimized blog posts using Perplexity web search + structured output.
// Saves directly to the BlogPost DB table for rendering at /blog/[slug].

import { getPerplexityClient, TRUSTED_DOMAINS } from "@/lib/ai/perplexity-client";
import { prisma } from "@/lib/db/prisma";
import type { BlogCategory } from "@prisma/client";

// ─── Content Schema ───────────────────────────────────────────────────────────

export interface BlogSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface BlogContent {
  intro: string;
  sections: BlogSection[];
  conclusion: string;
  faqs?: Array<{ q: string; a: string }>;
}

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  metaKeywords: string[];
  readingTimeMin: number;
  content: BlogContent;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const BLOG_SYSTEM_PROMPT = `You are an expert financial journalist and SEO writer for TrackTheDollar.com — a platform that tracks U.S. national debt, Federal Reserve data, inflation, defense spending, and foreign aid in real time using official government APIs.

Write comprehensive, SEO-optimized, factual blog articles. Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, just raw JSON):

{
  "title": "Full SEO-optimized article title",
  "slug": "kebab-case-url-slug-max-60-chars",
  "description": "155-160 character meta description with primary keyword near the start",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "metaKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "readingTimeMin": 6,
  "intro": "2-3 compelling sentences that include the primary keyword and establish authority",
  "sections": [
    {
      "heading": "H2 Section Heading With Keywords",
      "body": "Full paragraph of factual content...",
      "bullets": ["Optional bullet point 1", "Optional bullet 2"]
    }
  ],
  "conclusion": "Strong concluding paragraph summarizing key takeaways and linking to TrackTheDollar.com dashboard",
  "faqs": [
    { "q": "Question containing search terms?", "a": "Concise factual answer." }
  ]
}

Rules:
- Include 4-6 sections with substantive body text (100-200 words each)
- Include 4-6 FAQs targeting long-tail search queries
- Cite official sources: treasury.gov, federalreserve.gov, fred.stlouisfed.org, cbo.gov, bls.gov, usaspending.gov
- Never give investment or financial advice
- Focus on factual, educational, data-driven content
- Target 900-1400 total words across all sections
- Include specific numbers and statistics where available
- The conclusion should naturally reference tracking live data on TrackTheDollar.com`;

// ─── News Blog Topics (auto-generated weekly) ────────────────────────────────

export const NEWS_BLOG_TOPICS: Array<{ topic: string; category: BlogCategory }> = [
  { topic: "Latest U.S. national debt news and Treasury borrowing activity this week", category: "NEWS" },
  { topic: "Federal Reserve balance sheet and quantitative tightening update this week", category: "NEWS" },
  { topic: "U.S. inflation data and CPI trends — latest government release", category: "NEWS" },
  { topic: "Treasury auction results and bond market demand this week", category: "NEWS" },
  { topic: "Federal deficit and government spending news this week", category: "NEWS" },
  { topic: "U.S. dollar strength and currency market developments this week", category: "NEWS" },
  { topic: "Federal Reserve interest rate policy and FOMC meeting news", category: "NEWS" },
  { topic: "U.S. defense spending and military budget latest news", category: "NEWS" },
];

// ─── Educational Topics (seeded once, evergreen content) ─────────────────────

export const EDUCATION_BLOG_TOPICS: Array<{ topic: string; category: BlogCategory; slug?: string }> = [
  {
    topic: "The complete history of the U.S. dollar: from gold standard to fiat currency, Nixon shock, and the modern dollar",
    category: "EDUCATION",
    slug: "history-of-the-us-dollar",
  },
  {
    topic: "What is the Federal Reserve? A complete guide to America's central bank, its structure, mandate, and tools",
    category: "EDUCATION",
    slug: "what-is-the-federal-reserve",
  },
  {
    topic: "What is the U.S. national debt? How it works, why it matters, and who owns it",
    category: "EDUCATION",
    slug: "what-is-the-national-debt",
  },
  {
    topic: "How is inflation measured? CPI, Core CPI, PCE, and the Bureau of Labor Statistics explained",
    category: "EDUCATION",
    slug: "how-is-inflation-measured-cpi-explained",
  },
  {
    topic: "What is quantitative easing (QE) and quantitative tightening (QT)? Federal Reserve balance sheet explained",
    category: "EDUCATION",
    slug: "quantitative-easing-qe-quantitative-tightening-qt-explained",
  },
  {
    topic: "What is the U.S. debt ceiling? History, crises, and how Congress raises it",
    category: "EDUCATION",
    slug: "what-is-the-debt-ceiling",
  },
  {
    topic: "What is the yield curve and what does a yield curve inversion mean for the economy?",
    category: "EDUCATION",
    slug: "yield-curve-inversion-explained",
  },
  {
    topic: "What is M2 money supply and why does it matter for inflation and the economy?",
    category: "EDUCATION",
    slug: "what-is-m2-money-supply",
  },
  {
    topic: "What is the U.S. Dollar Index (DXY)? How dollar strength is measured and why it matters",
    category: "EDUCATION",
    slug: "what-is-the-dollar-index-dxy",
  },
  {
    topic: "How does the U.S. Treasury borrow money? T-bills, T-notes, T-bonds, and auction mechanics explained",
    category: "EDUCATION",
    slug: "how-the-us-treasury-borrows-money",
  },
  {
    topic: "Star note dollar bills: what they are, how rare they are, and what collectors pay for them",
    category: "TOOLS",
    slug: "star-note-dollar-bills-guide",
  },
  {
    topic: "Fancy serial numbers on dollar bills: radar notes, repeaters, ladders, solids — complete collector guide 2026",
    category: "TOOLS",
    slug: "fancy-serial-numbers-dollar-bills-guide",
  },
  {
    topic: "How to read a dollar bill: Federal Reserve districts, series year, serial numbers, and security features explained",
    category: "EDUCATION",
    slug: "how-to-read-a-dollar-bill",
  },
  {
    topic: "U.S. foreign aid explained: how much America gives, top recipient countries, and what the money funds",
    category: "ANALYSIS",
    slug: "us-foreign-aid-explained",
  },
  {
    topic: "U.S. defense spending breakdown: where the $886 billion goes, DoD budget categories, and historical trends",
    category: "ANALYSIS",
    slug: "us-defense-spending-breakdown",
  },
];

// ─── Core Generator ───────────────────────────────────────────────────────────

export interface GenerateBlogOptions {
  topic: string;
  category: BlogCategory;
  searchRecency?: "week" | "month" | "day";
  forceSlug?: string;
  /** If true, skip DB check for existing slug */
  force?: boolean;
}

/**
 * Generate a blog post using Perplexity, save to DB, return the slug.
 * Returns null if the slug already exists (unless force=true).
 */
export async function generateAndSaveBlogPost(
  options: GenerateBlogOptions
): Promise<{ slug: string; isNew: boolean } | null> {
  const client = getPerplexityClient();

  if (!client.isConfigured()) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  // Generate a tentative slug from the topic for pre-flight duplicate check
  const tentativeSlug = options.forceSlug ?? slugifyTopic(options.topic);

  if (!options.force) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: tentativeSlug } });
    if (existing) {
      return { slug: tentativeSlug, isNew: false };
    }
  }

  // Call Perplexity with sonar-pro for quality citations
  const response = await client.query(
    {
      model: "sonar-pro",
      messages: [
        { role: "system", content: BLOG_SYSTEM_PROMPT },
        { role: "user", content: `Write a comprehensive SEO blog article about: ${options.topic}` },
      ],
      maxTokens: 4000,
      temperature: 0.3,
      returnCitations: true,
      searchRecency: options.searchRecency,
      searchDomainFilter: TRUSTED_DOMAINS,
    },
    { feature: "blog_generation" }
  );

  // Parse the JSON response
  let parsed: GeneratedBlogPost;
  try {
    // Strip any accidental markdown fences
    const clean = response.content
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    // If JSON parse fails, try to extract JSON from the response
    const match = response.content.match(/\{[\s\S]+\}/);
    if (!match) {
      throw new Error(`Failed to parse blog post JSON from Perplexity response: ${response.content.slice(0, 200)}`);
    }
    parsed = JSON.parse(match[0]);
  }

  // Validate required fields
  if (!parsed.title || !parsed.content?.intro || !parsed.content?.sections?.length) {
    throw new Error("Perplexity response missing required blog fields");
  }

  const slug = options.forceSlug ?? parsed.slug ?? slugifyTopic(parsed.title);
  const readingTime = parsed.readingTimeMin ?? estimateReadingTime(parsed.content);
  const now = new Date();

  // Save to DB (upsert to handle retries)
  await prisma.blogPost.upsert({
    where: { slug },
    create: {
      slug,
      title: parsed.title,
      description: parsed.description,
      content: JSON.stringify(parsed.content),
      category: options.category,
      tags: parsed.tags ?? [],
      metaKeywords: parsed.metaKeywords ?? [],
      status: "PUBLISHED",
      publishedAt: now,
      isAutoGenerated: true,
      sources: response.citations,
      readingTimeMin: readingTime,
    },
    update: {
      title: parsed.title,
      description: parsed.description,
      content: JSON.stringify(parsed.content),
      tags: parsed.tags ?? [],
      metaKeywords: parsed.metaKeywords ?? [],
      sources: response.citations,
      readingTimeMin: readingTime,
      updatedAt: now,
    },
  });

  return { slug, isNew: true };
}

// ─── Batch: Seed Educational Posts ───────────────────────────────────────────

/**
 * Seed all educational topics that don't yet exist in the DB.
 * Returns a list of newly created slugs.
 */
export async function seedEducationalPosts(
  maxNew = 5
): Promise<string[]> {
  const created: string[] = [];

  for (const item of EDUCATION_BLOG_TOPICS) {
    if (created.length >= maxNew) break;

    const result = await generateAndSaveBlogPost({
      topic: item.topic,
      category: item.category,
      forceSlug: item.slug,
    });

    if (result?.isNew) {
      created.push(result.slug);
      console.info(`[blog] Created educational post: ${result.slug}`);
    }

    // Rate-limit between requests
    await sleep(2000);
  }

  return created;
}

// ─── Batch: Weekly News Posts ─────────────────────────────────────────────────

/**
 * Generate one news-driven blog post per day from the rotating topic list.
 * Uses a rotating index based on the day of year.
 */
export async function generateDailyNewsBlogPost(): Promise<string | null> {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const topic = NEWS_BLOG_TOPICS[dayOfYear % NEWS_BLOG_TOPICS.length];

  // Build a date-stamped slug to avoid collisions
  const dateStamp = new Date().toISOString().slice(0, 10); // "2026-03-20"
  const baseSlug = slugifyTopic(topic.topic).slice(0, 50);
  const slug = `${baseSlug}-${dateStamp}`;

  try {
    const result = await generateAndSaveBlogPost({
      topic: topic.topic,
      category: topic.category,
      searchRecency: "week",
      forceSlug: slug,
    });
    return result?.slug ?? null;
  } catch (err) {
    console.error("[blog] Daily news post generation failed:", err);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugifyTopic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function estimateReadingTime(content: BlogContent): number {
  const wordCount =
    [content.intro, content.conclusion]
      .concat(content.sections.map((s) => `${s.body} ${(s.bullets ?? []).join(" ")}`))
      .join(" ")
      .split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
