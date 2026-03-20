// src/app/rss.xml/route.ts
// RSS 2.0 feed for TrackTheDollar.com blog posts and topic articles.
// Enables Google News indexing, Feedly, and all major RSS readers.
// URL: /rss.xml

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ALL_SEO_PAGES } from "@/lib/seo/pages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackthedollar.com";
const FEED_TTL = 60; // minutes

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = new Date();

  // Fetch latest published blog posts
  let blogPosts: Array<{ slug: string; title: string; description: string; publishedAt: Date | null; category: string }> = [];
  try {
    blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true, description: true, publishedAt: true, category: true },
      take: 30,
    });
  } catch {
    // DB unavailable — continue with topic pages only
  }

  // Build RSS items from blog posts
  const blogItems = blogPosts.map((post) => {
    const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now.toUTCString();
    const link = `${BASE_URL}/blog/${post.slug}`;
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <source url="${BASE_URL}/rss.xml">TrackTheDollar.com</source>
    </item>`;
  });

  // Build RSS items from static SEO topic pages
  const topicItems = ALL_SEO_PAGES.slice(0, 20).map((page) => {
    const link = `${BASE_URL}/topics/${page.slug}`;
    return `
    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(page.description)}</description>
      <pubDate>${now.toUTCString()}</pubDate>
      <category>${escapeXml(page.category)}</category>
      <source url="${BASE_URL}/rss.xml">TrackTheDollar.com</source>
    </item>`;
  });

  const allItems = [...blogItems, ...topicItems].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>TrackTheDollar.com — U.S. Dollar, National Debt &amp; Fed Intelligence</title>
    <link>${BASE_URL}</link>
    <description>Real-time tracking and in-depth analysis of the U.S. national debt, Federal Reserve, inflation, dollar strength, defense spending, and fiscal policy — sourced from official U.S. government APIs.</description>
    <language>en-us</language>
    <copyright>Copyright ${now.getFullYear()} TrackTheDollar.com</copyright>
    <managingEditor>noreply@trackthedollar.com (TrackTheDollar.com)</managingEditor>
    <webMaster>noreply@trackthedollar.com (TrackTheDollar.com)</webMaster>
    <pubDate>${now.toUTCString()}</pubDate>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <ttl>${FEED_TTL}</ttl>
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>TrackTheDollar.com</title>
      <link>${BASE_URL}</link>
    </image>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${allItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
