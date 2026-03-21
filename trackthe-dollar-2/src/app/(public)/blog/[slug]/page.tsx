// src/app/(public)/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, TrendingUp, BookOpen, BarChart3, Wrench, Search } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/lib/utils/constants";
import { LandingNav } from "@/components/landing/LandingNav";
import type { BlogCategory } from "@prisma/client";
import type { BlogContent } from "@/lib/blog/generator";

export const revalidate = 3600; // revalidate hourly

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { title: true, description: true, metaKeywords: true, publishedAt: true, updatedAt: true },
  });
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.metaKeywords,
    alternates: { canonical: `${APP_URL}/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${APP_URL}/blog/${params.slug}`,
      type: "article",
      siteName: "TrackTheDollar.com",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const CATEGORY_META: Record<BlogCategory, { label: string; icon: React.ElementType; color: string }> = {
  NEWS:      { label: "News",      icon: TrendingUp, color: "text-negative" },
  EDUCATION: { label: "Education", icon: BookOpen,   color: "text-primary" },
  ANALYSIS:  { label: "Analysis",  icon: BarChart3,  color: "text-purple-400" },
  TOOLS:     { label: "Tools",     icon: Wrench,     color: "text-gold-400" },
};

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  let content: BlogContent;
  try {
    content = JSON.parse(post.content);
  } catch {
    notFound();
  }

  const sources = Array.isArray(post.sources) ? (post.sources as string[]) : [];
  const catMeta = CATEGORY_META[post.category];

  // Related posts from same category
  const related = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", category: post.category, slug: { not: post.slug } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, readingTimeMin: true },
    take: 3,
  });

  // JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${APP_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "TrackTheDollar.com", url: APP_URL },
    publisher: { "@type": "Organization", name: "TrackTheDollar.com", url: APP_URL },
    keywords: post.metaKeywords.join(", "),
  };

  const faqSchema = content.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APP_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${APP_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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

        <main className="mx-auto max-w-3xl px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <span>/</span>
            <span className="text-foreground/60 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Article header */}
          <header className="mb-10">
            <span className={`label-sm font-semibold ${catMeta.color}`}>
              {catMeta.label.toUpperCase()}
            </span>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{post.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              )}
              {post.readingTimeMin && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readingTimeMin} min read
                </span>
              )}
            </div>
          </header>

          {/* Intro */}
          <p className="mb-8 text-base leading-relaxed text-foreground/80">{content.intro}</p>

          {/* Sections */}
          <div className="space-y-8">
            {content.sections.map((section, i) => (
              <section key={i}>
                <h2 className="mb-3 text-xl font-bold tracking-tight">{section.heading}</h2>
                <p className="text-sm leading-relaxed text-foreground/75">{section.body}</p>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="my-10 rounded-xl border border-border bg-card/50 p-6">
            <p className="text-sm leading-relaxed text-foreground/80">{content.conclusion}</p>
          </div>

          {/* CTA — Serial Number Checker (if TOOLS category or relevant) */}
          {(post.category === "TOOLS" || post.tags.some(t => t.toLowerCase().includes("serial") || t.toLowerCase().includes("dollar bill"))) && (
            <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-4">
                <Search className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Check Your Dollar Bill's Serial Number</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Decode the Federal Reserve district, detect star notes, and check if your bill has a fancy serial number — free.
                  </p>
                  <Link
                    href="/tools/serial-number"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-gold-300"
                  >
                    Try the Serial Number Checker <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard CTA */}
          <div className="mb-10 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Track This Data Live on TrackTheDollar.com</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Real-time charts, live counters, and full macro dashboard — sourced from official U.S. government APIs.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-gold-500"
                >
                  Open Live Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQs */}
          {content.faqs && content.faqs.length > 0 && (
            <section className="mb-10" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="mb-6 text-xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {content.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card/40 p-5">
                    <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-border bg-surface-2 px-2.5 py-0.5 text-2xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mb-10 rounded-xl border border-border p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sources</p>
              <ul className="space-y-1.5">
                {sources.slice(0, 8).map((src, i) => (
                  <li key={i}>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-2xs text-primary hover:text-gold-300 truncate"
                    >
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Related Articles
              </h2>
              <div className="space-y-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card/30 p-4 transition-all hover:border-primary/20 hover:bg-card/60 group"
                  >
                    <span className="text-sm text-foreground/80 group-hover:text-foreground">{r.title}</span>
                    <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                      {r.readingTimeMin && (
                        <span className="text-2xs">{r.readingTimeMin} min</span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
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
