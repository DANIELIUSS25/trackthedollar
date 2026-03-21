// src/app/(public)/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, TrendingUp, Wrench, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/lib/utils/constants";
import { LandingNav } from "@/components/landing/LandingNav";
import type { BlogCategory } from "@prisma/client";

export const revalidate = 1800; // revalidate every 30 minutes

export const metadata: Metadata = {
  title: "Blog — U.S. Dollar, Federal Reserve & National Debt Explained | TrackTheDollar.com",
  description:
    "In-depth articles on the U.S. dollar, national debt, Federal Reserve, inflation, interest rates, and fiscal policy — all backed by official government data.",
  keywords: [
    "us dollar blog",
    "national debt explained",
    "federal reserve explained",
    "inflation articles",
    "fiscal policy blog",
    "dollar history",
    "trackthedollar blog",
    "us dollar news",
  ],
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: "TrackTheDollar Blog — U.S. Dollar & National Debt Analysis",
    description: "Data-driven articles on the U.S. dollar system, national debt, and Federal Reserve — sourced from official government APIs.",
    url: `${APP_URL}/blog`,
    type: "website",
    siteName: "TrackTheDollar.com",
  },
};

const CATEGORY_META: Record<BlogCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NEWS:      { label: "News",      icon: TrendingUp, color: "text-negative",    bg: "bg-negative/10" },
  EDUCATION: { label: "Education", icon: BookOpen,   color: "text-primary",     bg: "bg-primary/10" },
  ANALYSIS:  { label: "Analysis",  icon: BarChart3,  color: "text-purple-400",  bg: "bg-purple-400/10" },
  TOOLS:     { label: "Tools",     icon: Wrench,     color: "text-gold-400",    bg: "bg-gold-400/10" },
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      description: true,
      category: true,
      tags: true,
      publishedAt: true,
      readingTimeMin: true,
    },
    take: 50,
  }).catch(() => []);

  const featured = posts[0];
  const rest = posts.slice(1);

  const byCategory = {
    NEWS:      rest.filter((p) => p.category === "NEWS"),
    EDUCATION: rest.filter((p) => p.category === "EDUCATION"),
    ANALYSIS:  rest.filter((p) => p.category === "ANALYSIS"),
    TOOLS:     rest.filter((p) => p.category === "TOOLS"),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "TrackTheDollar Blog",
    description: "Data-driven articles on the U.S. dollar, national debt, Federal Reserve, and fiscal policy.",
    url: `${APP_URL}/blog`,
    publisher: { "@type": "Organization", name: "TrackTheDollar.com", url: APP_URL },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${APP_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt?.toISOString(),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center">
              <span className="text-sm font-bold tracking-tight">
                TrackThe<span className="text-primary">Dollar</span>
                <span className="text-[11px] font-semibold text-primary/70">.com</span>
              </span>
            </Link>
            <LandingNav />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-16">
          {/* Header */}
          <div className="mb-12 max-w-2xl">
            <p className="label-md mb-2 text-primary">From the Blog</p>
            <h1 className="text-display-md font-bold tracking-tight">
              The U.S. Dollar, Explained.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Data-driven articles on national debt, the Federal Reserve, inflation, dollar history,
              and fiscal policy — updated with live government data.
            </p>
          </div>

          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group mb-12 block overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/20 hover:shadow-panel-raised"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <CategoryChip category={featured.category} />
                      <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground group-hover:text-primary">
                        {featured.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {featured.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <PostMeta post={featured} />
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Read article <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Category grids */}
              {(["EDUCATION", "NEWS", "ANALYSIS", "TOOLS"] as BlogCategory[]).map((cat) => {
                const items = byCategory[cat];
                if (!items.length) return null;
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <section key={cat} className="mb-12">
                    <div className="mb-5 flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg}`}>
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {meta.label}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((post) => (
                        <PostCard key={post.slug} post={post} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </main>

        <footer className="border-t border-border bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between text-2xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} TrackTheDollar.com</span>
            <span>Not financial advice. For informational purposes only.</span>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type PostPreview = {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  tags: string[];
  publishedAt: Date | null;
  readingTimeMin: number | null;
};

function PostCard({ post }: { post: PostPreview }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group panel flex flex-col p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-panel-raised"
    >
      <CategoryChip category={post.category} />
      <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
        {post.title}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {post.description}
      </p>
      <div className="mt-4 border-t border-border pt-3">
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

function CategoryChip({ category }: { category: BlogCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={`label-sm font-semibold ${meta.color}`}>
      {meta.label.toUpperCase()}
    </span>
  );
}

function PostMeta({ post }: { post: Pick<PostPreview, "publishedAt" | "readingTimeMin"> }) {
  return (
    <div className="flex items-center gap-3 text-2xs text-muted-foreground">
      {post.publishedAt && (
        <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      )}
      {post.readingTimeMin && (
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {post.readingTimeMin} min read
        </span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm font-medium text-muted-foreground">Articles are being generated.</p>
      <p className="mt-1 text-xs text-muted-foreground/60">Check back soon — our AI writer is at work.</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        View Live Dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
