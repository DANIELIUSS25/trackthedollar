// Server component — rendered at build/revalidation time for SEO
import { fetchGovAlerts } from "@/lib/api/gov-alerts";

export const revalidate = 300;

export default async function LatestNewsSEO() {
  let headlines: { title: string; link: string; date: string; sourceLabel: string }[] = [];

  try {
    const alerts = await fetchGovAlerts();
    headlines = alerts.slice(0, 20).map((a) => ({
      title: a.title,
      link: a.link,
      date: a.date,
      sourceLabel: a.sourceLabel,
    }));
  } catch {
    // Fail silently — SEO fallback
  }

  if (headlines.length === 0) return null;

  // JSON-LD structured data for Google News
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest U.S. Government Financial News",
    description: "Real-time updates from the Federal Reserve, US Treasury, White House, BLS, CBO, and BEA.",
    itemListElement: headlines.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: h.title,
        url: h.link,
        datePublished: h.date,
        publisher: {
          "@type": "Organization",
          name: h.sourceLabel,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Visually hidden but crawlable section — SEO-targeted */}
      <section
        aria-label="Latest government news"
        className="sr-only"
        data-seo="gov-alerts"
      >
        <h2>Latest U.S. Government Financial News</h2>
        <ul>
          {headlines.map((h) => (
            <li key={h.link + h.date}>
              <a href={h.link} rel="noopener noreferrer">
                {h.title}
              </a>
              <time dateTime={h.date}>
                {new Date(h.date).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </time>
              <span>{h.sourceLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
