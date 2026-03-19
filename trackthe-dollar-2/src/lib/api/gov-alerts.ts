import Parser from "rss-parser";

export interface GovAlert {
  id: string;
  title: string;
  link: string;
  date: string; // ISO string
  source: string;
  sourceLabel: string;
  category: "fed" | "treasury" | "whitehouse" | "labor" | "cbo" | "bea" | "congress";
  summary?: string;
}

const parser = new Parser({ timeout: 8000 });

const FEEDS: { url: string; source: string; label: string; category: GovAlert["category"] }[] = [
  {
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    source: "federalreserve.gov",
    label: "Federal Reserve",
    category: "fed",
  },
  {
    url: "https://home.treasury.gov/news/press-releases/rss.xml",
    source: "treasury.gov",
    label: "US Treasury",
    category: "treasury",
  },
  {
    url: "https://www.whitehouse.gov/feed/",
    source: "whitehouse.gov",
    label: "White House",
    category: "whitehouse",
  },
  {
    url: "https://www.bls.gov/feed/bls_release.rss",
    source: "bls.gov",
    label: "Bureau of Labor Statistics",
    category: "labor",
  },
  {
    url: "https://www.cbo.gov/publications/rss",
    source: "cbo.gov",
    label: "CBO",
    category: "cbo",
  },
  {
    url: "https://apps.bea.gov/rss/rss.xml",
    source: "bea.gov",
    label: "Bureau of Econ. Analysis",
    category: "bea",
  },
];

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<GovAlert[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items ?? []).slice(0, 15).map((item) => {
      const snippet = item.contentSnippet?.slice(0, 200) ?? (item as Record<string, unknown>)["summary"] as string | undefined;
      return {
        id: `${feed.source}-${item.guid ?? item.link ?? item.title ?? Math.random()}`,
        title: (item.title ?? "").trim(),
        link: item.link ?? item.guid ?? "",
        date: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: feed.source,
        sourceLabel: feed.label,
        category: feed.category,
        ...(snippet ? { summary: snippet.slice(0, 200) } : {}),
      } satisfies GovAlert;
    });
  } catch {
    return [];
  }
}

/** Fetch all government alert feeds in parallel, return sorted newest-first */
export async function fetchGovAlerts(): Promise<GovAlert[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all: GovAlert[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  // Sort newest first, deduplicate by title similarity
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Deduplicate by exact title
  const seen = new Set<string>();
  return all.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const CATEGORY_COLORS: Record<GovAlert["category"], string> = {
  fed: "#3b82f6",       // blue
  treasury: "#10b981",  // green
  whitehouse: "#f59e0b", // amber
  labor: "#8b5cf6",     // purple
  cbo: "#6b7280",       // gray
  bea: "#06b6d4",       // cyan
  congress: "#ef4444",  // red
};
