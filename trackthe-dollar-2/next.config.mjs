// @ts-check

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://pagead2.googlesyndication.com https://www.googletagservices.com https://partner.googleadservices.com https://tpc.googlesyndication.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.stripe.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.google.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;
  connect-src 'self' https://api.stripe.com https://*.sentry.io https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google;
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/stripe/webhook",
        headers: [{ key: "x-raw-body", value: "1" }],
      },
    ];
  },

  poweredByHeader: false,

  async redirects() {
    const base = [
      { source: "/login", destination: "/upgrade", permanent: false },
      { source: "/signin", destination: "/upgrade", permanent: false },
      { source: "/register", destination: "/upgrade", permanent: false },
      { source: "/signup", destination: "/upgrade", permanent: false },
    ];
    return process.env.NODE_ENV === "production"
      ? [
          {
            source: "/:path*",
            has: [{ type: "host", value: "www.trackthedollar.com" }],
            destination: "https://trackthedollar.com/:path*",
            permanent: true,
          },
          ...base,
        ]
      : base;
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
