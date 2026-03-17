// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toast";
import QueryProvider from "@/components/shared/QueryProvider";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/lib/utils/constants";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    // Core brand
    "track the dollar",
    "trackthedollar",
    "dollar tracker",
    // National debt
    "us national debt",
    "national debt clock",
    "us debt clock live",
    "national debt tracker",
    "national debt 39 trillion",
    "national debt all time high",
    "national debt real time",
    "how much is the national debt",
    "us national debt today",
    "national debt per citizen",
    "national debt per person",
    "us debt to gdp ratio",
    "total us debt",
    "federal debt",
    "government debt tracker",
    "us debt clock 2026",
    "national debt chart",
    "public debt outstanding",
    "debt to the penny",
    "treasury debt",
    // Interest rates
    "fed interest rate",
    "federal funds rate",
    "interest rates today",
    "10 year treasury yield",
    "2 year treasury yield",
    "treasury yield curve",
    "yield curve inverted",
    "fed funds rate today",
    "interest rates fed funds",
    "fomc rate decision",
    // Inflation
    "inflation rate today",
    "cpi inflation",
    "inflation tracker cpi",
    "consumer price index",
    "us inflation rate",
    "core cpi",
    "inflation chart",
    "cpi data",
    "breakeven inflation rate",
    // Federal Reserve
    "fed balance sheet",
    "federal reserve balance sheet",
    "quantitative tightening",
    "qt tracker",
    "fed total assets",
    "fed balance sheet tracker",
    "monetary policy tracker",
    // Money supply
    "money supply m2",
    "m2 money supply chart",
    "m2 money stock",
    "money printing tracker",
    "reserve balances",
    // Government spending
    "government spending tracker",
    "federal spending breakdown",
    "us budget deficit",
    "budget deficit 2026",
    "federal budget",
    "where do my taxes go",
    "government spending chart",
    // Defense & military
    "defense spending tracker",
    "military spending",
    "dod budget",
    "defense budget 2026",
    "us military budget",
    // Foreign aid
    "foreign aid tracker",
    "us foreign aid",
    "usaid spending",
    "foreign assistance",
    "how much foreign aid does the us give",
    // Dollar
    "us dollar index",
    "dollar strength index",
    "dxy index",
    "trade weighted dollar",
    "dollar value",
    // Liquidity
    "treasury general account",
    "tga balance",
    "net liquidity tracker",
    "reverse repo facility",
    "fed liquidity",
    // Macro & fiscal
    "fiscal data",
    "macro intelligence platform",
    "us economic data",
    "real time economic data",
    "government data dashboard",
    "fiscal policy tracker",
    "us treasury data",
    "interest on national debt",
    "debt interest payments",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
  ],
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="font-sans"
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9686970386773995"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
