import type { MetadataRoute } from "next";
import { ALL_SEO_PAGES } from "@/lib/seo/pages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackthedollar.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticPages, ...dashboardPages, ...topicPages];
}
