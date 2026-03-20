import type { MetadataRoute } from "next";
import { ALL_SEO_PAGES } from "@/lib/seo/pages";
import { prisma } from "@/lib/db/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackthedollar.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/upgrade`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/us-debt`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/serial-number`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  // Dashboard sub-pages
  const dashboardPages: MetadataRoute.Sitemap = [
    "debt",
    "inflation",
    "rates",
    "dollar-strength",
    "money-supply",
    "monetary-expansion",
    "fiscal",
    "liquidity",
    "defense",
    "war-spending",
    "foreign-assistance",
    "methodology",
    "source-health",
  ].map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Dynamic SEO topic pages
  const topicPages: MetadataRoute.Sitemap = ALL_SEO_PAGES.map((page) => ({
    url: `${BASE_URL}/topics/${page.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Blog posts — fetched live from DB
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, category: true },
      orderBy: { publishedAt: "desc" },
    });

    blogPages = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: post.category === "NEWS" ? ("daily" as const) : ("weekly" as const),
      priority: post.category === "NEWS" ? 0.75 : 0.8,
    }));
  } catch {
    // DB unavailable at build time — skip blog entries
  }

  return [...staticPages, ...dashboardPages, ...topicPages, ...blogPages];
}
