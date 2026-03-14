import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui CSS variable tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Surface layers for depth
        surface: {
          0: "hsl(var(--surface-0))",
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },

        // Financial semantic tokens
        positive: {
          DEFAULT: "#16c784",
          muted: "#0d9e65",
          subtle: "rgba(22,199,132,0.08)",
        },
        negative: {
          DEFAULT: "#ea3943",
          muted: "#c42e36",
          subtle: "rgba(234,57,67,0.08)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          subtle: "rgba(245,158,11,0.08)",
        },
        info: {
          DEFAULT: "#3b82f6",
          subtle: "rgba(59,130,246,0.08)",
        },

        // Dollar Gold scale
        gold: {
          50: "#FEF9E7",
          100: "#FDF0C4",
          200: "#FBE38A",
          300: "#F8D14E",
          400: "#F0B429",
          500: "#D99B1E",
          600: "#B87D15",
          700: "#8C5E10",
          800: "#614008",
          900: "#3A2605",
        },

        // Terminal palette
        terminal: {
          bg: "#06080C",
          panel: "#0B1018",
          raised: "#111824",
          overlay: "#1A2332",
          border: "#1E2738",
          text: "#E2E8F0",
          dim: "#6b7a99",
          highlight: "#f0b429",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-mono)", "JetBrains Mono", "SF Mono", "Fira Code", ...fontFamily.mono],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        "data-hero": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "data-xl": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "data-lg": ["1.125rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "sidebar": "15rem",       // 240px expanded
        "sidebar-sm": "4rem",     // 64px collapsed
        "topbar": "3.5rem",       // 56px
      },
      maxWidth: {
        "dashboard": "90rem",     // 1440px for ultra-wide
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
        "skeleton": "skeleton-pulse 1.5s ease-in-out infinite",
      },
      boxShadow: {
        "panel":
          "0 0 0 1px hsl(var(--border)), 0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)",
        "panel-raised":
          "0 0 0 1px hsl(var(--border)), 0 2px 6px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.2)",
        "glow":
          "0 0 24px rgba(240,180,41,0.12)",
        "glow-strong":
          "0 0 40px rgba(240,180,41,0.2)",
      },
      transitionDuration: {
        "micro": "100ms",
        "standard": "150ms",
        "layout": "200ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
