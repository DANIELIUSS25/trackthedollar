import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackthedollar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${BASE}`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${BASE}/dashboard`, changeFrequency: "hourly" as const, priority: 0.95 },
    { url: `${BASE}/debt`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/dollar-strength`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/rates`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/inflation`, changeFrequency: "monthly" as const, priority: 0.85 },
    { url: `${BASE}/money-supply`, changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${BASE}/defense`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE}/foreign-assistance`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE}/monetary-expansion`, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${BASE}/war-spending`, changeFrequency: "monthly" as const, priority: 0.75 },
    { url: `${BASE}/methodology`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/source-health`, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  return staticPages.map((page) => ({
    ...page,
    lastModified: now,
  }));
}
