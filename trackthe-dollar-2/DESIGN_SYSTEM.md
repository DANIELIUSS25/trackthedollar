# TrackTheDollar — Premium UI/UX Design System

## Visual Direction

TrackTheDollar occupies a specific visual territory: **institutional authority meets modern clarity**. It sits between Bloomberg Terminal's raw data density and Stripe's refined SaaS polish — a product that a macro hedge fund analyst would trust and a financially literate citizen would understand.

### Design Principles

1. **Data Gravity** — Numbers are the product. Every visual decision serves the data. Typography, spacing, and color exist to make numbers scannable, comparable, and actionable in under 3 seconds.

2. **Structured Density** — Pack more information per viewport than typical SaaS, but with clear visual hierarchy. No element fights for attention. The eye knows where to go.

3. **Institutional Trust** — Every pixel communicates credibility. Source citations on every metric. Timestamps on every data point. No decorative gradients, no playful illustrations, no rounded avatars. This is a tool, not an app.

4. **Calm Urgency** — Changes are highlighted without drama. Green/red indicators state facts; they don't scream. The interface stays calm when markets don't.

5. **Systematic Consistency** — Every card, every chart, every number follows the same visual grammar. Users learn the system once and read everything fluently.

---

## Color Palette

### Core Palette

```
Background Layers (Dark Mode — Primary)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layer 0 (deepest):    #06080C    hsl(220, 30%, 3%)     — page background
Layer 1 (surface):    #0B1018    hsl(220, 30%, 6%)     — card backgrounds
Layer 2 (raised):     #111824    hsl(220, 28%, 10%)    — elevated cards, modals
Layer 3 (overlay):    #1A2332    hsl(218, 25%, 15%)    — dropdowns, popovers
```

```
Border System
━━━━━━━━━━━━━
Subtle:    #151D2B    hsl(220, 25%, 12%)    — card borders, dividers
Default:   #1E2738    hsl(218, 23%, 17%)    — input borders, separators
Strong:    #2A3548    hsl(216, 22%, 22%)    — active borders, focus rings
Accent:    #F0B429/20                       — gold glow borders on hover
```

```
Primary Accent — Dollar Gold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
50:   #FEF9E7     — subtle bg tint
100:  #FDF0C4
200:  #FBE38A
300:  #F8D14E
400:  #F0B429     — PRIMARY — dollar gold, CTAs, active states
500:  #D99B1E     — hover state
600:  #B87D15     — pressed state
700:  #8C5E10
800:  #614008
900:  #3A2605     — dark gold text on light bg
```

```
Semantic — Financial Signals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Positive:     #16C784    — green for gains, surplus, improvement
Pos Muted:    #0D9E65    — secondary positive
Pos Subtle:   rgba(22, 199, 132, 0.08)    — background tint
Pos Glow:     rgba(22, 199, 132, 0.15)    — pulse/glow effects

Negative:     #EA3943    — red for losses, deficit, decline
Neg Muted:    #C42E36    — secondary negative
Neg Subtle:   rgba(234, 57, 67, 0.08)     — background tint
Neg Glow:     rgba(234, 57, 67, 0.15)     — pulse effects

Neutral:      #6B7A99    — unchanged, no data
Warning:      #F59E0B    — caution, approaching threshold
Info:         #3B82F6    — informational, links, TGA blue
```

```
Text Hierarchy
━━━━━━━━━━━━━━
Primary:      #E2E8F0    — headlines, primary numbers
Secondary:    #B4BFD0    — body text, descriptions
Tertiary:     #7C8CA8    — labels, timestamps, captions
Quaternary:   #4A5568    — disabled, placeholder
On-Gold:      #0B1018    — text on gold backgrounds
```

### Light Mode (Secondary — for embeds/exports)

```
Background:   #F8F9FB
Surface:      #FFFFFF
Border:       #E2E7EF
Text:         #1A202C
Muted:        #718096
```

### Why This Palette Works
- The deep blue-black backgrounds are cooler and more refined than pure black (#000)
- Gold (#F0B429) reads as "currency" and "premium" without being garish
- Green/red are the universal financial language — not inventive, deliberately conventional
- The 4-layer background system creates depth without drop shadows
- Text colors have enough contrast (7:1+ on dark bg) for WCAG AA compliance

---

## Typography System

### Font Stack

```
--font-display:  "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif
--font-data:     "JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", monospace
```

### Type Scale

```
Display — Used once per page maximum
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
display-xl:   48px / 1.1    -0.02em    Inter 700    — hero headline only
display-lg:   36px / 1.15   -0.02em    Inter 700    — section hero
display-md:   28px / 1.2    -0.015em   Inter 600    — page titles

Headings
━━━━━━━━
h1:           22px / 1.3    -0.01em    Inter 600    — dashboard section titles
h2:           16px / 1.4    -0.005em   Inter 600    — card titles, panel headers
h3:           14px / 1.4    0          Inter 500    — sub-headings, labels

Body
━━━━
body-lg:      16px / 1.6    0          Inter 400    — long descriptions, methodology
body-md:      14px / 1.5    0          Inter 400    — standard body text
body-sm:      13px / 1.5    0.005em    Inter 400    — secondary text, tooltips
body-xs:      12px / 1.4    0.01em     Inter 400    — timestamps, footnotes

Data Numbers (always JetBrains Mono)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
data-hero:    36px / 1.1    -0.02em    JBMono 600   — hero statistics
data-xl:      24px / 1.2    -0.01em    JBMono 600   — primary metric values
data-lg:      18px / 1.2    -0.01em    JBMono 500   — card metric values
data-md:      14px / 1.3    0          JBMono 400   — table values, chart labels
data-sm:      12px / 1.3    0.005em    JBMono 400   — sparkline labels, secondary data
data-xs:      10px / 1.2    0.02em     JBMono 400   — axis ticks, minimal labels

Labels (Always Uppercase)
━━━━━━━━━━━━━━━━━━━━━━━━━
label-lg:     12px / 1.3    0.08em     Inter 600    — section headers
label-md:     11px / 1.3    0.06em     Inter 500    — card labels, metric names
label-sm:     10px / 1.3    0.08em     Inter 500    — chart axis labels, footnotes
```

### Typography Rules

1. **Numbers are always monospace** — JetBrains Mono with `font-variant-numeric: tabular-nums` for column alignment
2. **Labels are always uppercase** — with generous letter-spacing (0.06-0.08em)
3. **No font size below 10px** — even in data-dense views
4. **Inter for prose, JetBrains for data** — never mix in the same visual element
5. **Negative letter-spacing on display sizes** — tightens headlines for editorial feel
6. **Line heights compress at larger sizes** — display text is tighter, body text is looser

---

## Spacing System

### Base Unit: 4px

```
Space Scale
━━━━━━━━━━━
0:     0px
px:    1px
0.5:   2px       — micro gaps (icon-to-text inline)
1:     4px       — tight padding (badges, chips)
1.5:   6px       — compact padding
2:     8px       — default gap between inline items
3:     12px      — card internal padding (compact)
4:     16px      — standard card padding
5:     20px      — comfortable card padding
6:     24px      — section padding, shell margin
8:     32px      — between card groups
10:    40px      — between major sections
12:    48px      — page section spacing
16:    64px      — hero section padding
20:    80px      — landing page sections
24:    96px      — maximum section spacing
```

### Spacing Rules

1. **Cards**: Always `p-4` (16px) minimum. `p-5` (20px) for feature cards. `p-6` (24px) for hero cards.
2. **Between cards in a grid**: `gap-3` (12px) for metric grids. `gap-4` (16px) for feature grids.
3. **Between sections**: `space-y-6` (24px) in dashboards. `space-y-8` (32px) on landing pages.
4. **Section label to content**: `mb-3` (12px) — tight but clear separation.
5. **Page padding**: `p-6` (24px) in dashboard shell. `px-6` + `max-w-7xl mx-auto` for public pages.
6. **Sidebar width**: 240px expanded, 64px collapsed.
7. **Top bar height**: 56px (h-14).

---

## Card & Component System

### Card Hierarchy

```
Level 1 — Metric Card (data-first, compact)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background:    Layer 1 (surface)
Border:        1px solid subtle
Border-radius: 8px (rounded-lg)
Padding:       16px
Shadow:        panel shadow (subtle depth)
Hover:         border transitions to accent/30

Internal layout:
  ┌─────────────────────────────────┐
  │ LABEL                    +2.3% │  ← label-md + change badge
  │                                │
  │ $36.218T              ╱╲╱╲╱╲╱  │  ← data-xl + sparkline
  │ As of Mar 13, 2026             │  ← body-xs, tertiary color
  └─────────────────────────────────┘

Level 2 — Panel Card (section container)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background:    Layer 1
Border:        1px solid subtle
Border-radius: 8px
Padding:       20px
Header:        h2 + optional right-side controls

Level 3 — Feature Card (marketing, richer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background:    Layer 1 with subtle gradient
Border:        1px solid subtle
Border-radius: 12px (rounded-xl)
Padding:       24px
Hover:         border glow + slight translateY(-1px)

Level 4 — Hero Card (maximum emphasis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background:    Layer 2 with radial gradient accent
Border:        1px solid accent/20
Border-radius: 16px (rounded-2xl)
Padding:       32px
Shadow:        glow shadow
```

### Component Inventory

```
Data Display
━━━━━━━━━━━━
MetricCard          — value + change + sparkline + label
MetricCardLarge     — hero-sized metric for above-the-fold
DataTable           — sortable, scrollable financial table
BarBreakdown        — horizontal bar chart with category labels
TimeSeriesChart     — area chart with grid, tooltip, responsive
SparklineChart      — minimal inline chart for cards
CompositionBar      — percentage bar with segments
ConfidenceBadge     — data freshness/source indicator (●  LIVE | ● 1H AGO)

Navigation & Layout
━━━━━━━━━━━━━━━━━━━
Sidebar             — collapsible nav with status dots
TopBar              — page title + actions + live clock
Shell               — responsive content wrapper
TickerStrip         — scrolling horizontal data ticker
BreadcrumbNav       — for deep pages (Phase 2)

Status & Feedback
━━━━━━━━━━━━━━━━━
StatusDot           — colored dot (green/yellow/red/gray) for live status
ChangeBadge         — percentage/value change with arrow + color
AlertWidget         — compact alert notification
Toast               — ephemeral notification
LoadingSpinner      — subtle loading state
EmptyState          — no-data placeholder
ErrorState          — error with retry action

Content & Intelligence
━━━━━━━━━━━━━━━━━━━━━━
AIBriefingCard      — AI-generated summary with source citations
EventFeedItem       — timeline entry (date + event + impact)
EventFeed           — vertical timeline of fiscal/monetary events
WhatChangedToday    — highlighted daily deltas section
SourceCitation      — inline data source reference
MethodologyNote     — expandable methodology explanation

Marketing & Public
━━━━━━━━━━━━━━━━━━
HeroStat            — large animated statistic for landing page
FeatureCard         — product feature with icon + description
PricingCard         — subscription tier comparison
FooterLink          — minimal footer navigation
```

---

## Chart Presentation Rules

### General Rules

1. **Dark backgrounds always** — charts sit on Layer 1 (#0B1018), never white
2. **Grid lines are whispers** — `stroke: #151D2B`, dashed, horizontal only
3. **No chart borders** — the panel card provides the frame
4. **Tooltips are terminal-style** — dark bg, monospace numbers, sharp corners
5. **No animations on load** — data appears instantly. Animation implies uncertainty.
6. **Y-axis on left, formatted compact** — $6.8T not $6,800,000,000,000
7. **X-axis dates**: MMM 'YY for yearly views, MMM DD for monthly, HH:MM for intraday

### Color Assignment

```
Primary series:     #F0B429 (gold)        — default, featured metric
Positive trend:     #16C784 (green)       — Fed BS, surplus, gains
Negative trend:     #EA3943 (red)         — debt growth, deficit, losses
Secondary series:   #3B82F6 (blue)        — TGA, comparison data
Tertiary series:    #8B5CF6 (purple)      — RRP, supplementary data
Neutral series:     #6B7A99 (gray)        — baselines, projections
```

### Area Chart Gradients

```
Fill gradient:
  Top:    series-color at 12% opacity
  Bottom: series-color at 0% opacity
This creates depth without obscuring grid lines.
```

### Chart Heights

```
Hero chart:         400-500px    — main feature chart on detail pages
Standard chart:     300px        — default for dashboard panels
Compact chart:      200px        — secondary charts, comparisons
Sparkline:          40px         — inline in metric cards
Micro sparkline:    24px         — inline in tables (Phase 2)
```

---

## Layout Rules

### Desktop (1280px+)

```
┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR 240px]  │  [TOPBAR — full width]                │
│                  ├───────────────────────────────────────│
│  Dashboard       │  [CONTENT — max-w-7xl, p-6]          │
│  National Debt   │                                       │
│  Liquidity       │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  Fiscal Flows    │  │METRIC│ │METRIC│ │METRIC│ │METRIC││
│  Markets         │  └──────┘ └──────┘ └──────┘ └──────┘│
│  Alerts          │                                       │
│                  │  ┌────────────────────────────────────│
│  ──────          │  │         CHART (300px)              │
│  Settings        │  └────────────────────────────────────│
│  Collapse ◀      │                                       │
└──────────────────────────────────────────────────────────┘

Grid: 4-5 columns for metric cards
Charts: full width within content area
Tables: full width with horizontal scroll on overflow
```

### Tablet (768px - 1279px)

```
Sidebar collapses to 64px (icon-only)
Grid: 2-3 columns for metric cards
Charts: full width, height may reduce to 250px
Tables: horizontal scroll enabled
```

### Mobile (< 768px)

```
Sidebar: hidden, hamburger menu in topbar
Grid: 1 column, cards stack vertically
Charts: full width, 200px height minimum
Ticker strip: single row, auto-scroll
TopBar: simplified (title only, actions in menu)
```

### Landing Page Layout

```
Full width, no sidebar
max-w-7xl centered
Sections separated by border-bottom + 80px padding
Hero: centered text, max-w-3xl
Feature grid: 2x2 on desktop, 1 column on mobile
```

---

## Homepage Wireframe (Detailed)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, h-14, bg-blur)                                     │
│  [$] TrackTheDollar                    [Pricing] [Login] [Dashboard]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ TICKER STRIP (full width, auto-scroll) ────────────────────┐   │
│  │ NATIONAL DEBT $36.218T ▲  │  FED BS $6.82T ▼  │  TGA $782B │   │
│  │ │  RRP $147B ▼  │  NET LIQ $5.89T  │  10Y 4.32% ▲  │      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ HERO (py-24, centered) ────────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌ badge ┐                                                  │   │
│  │  │ INSTITUTIONAL-GRADE MACRO INTELLIGENCE │                 │   │
│  │  └───────┘                                                  │   │
│  │                                                             │   │
│  │  The U.S. Dollar System.                                    │   │
│  │  Tracked.                                   (display-xl)    │   │
│  │                                                             │   │
│  │  Real-time national debt, Treasury operations, Fed          │   │
│  │  liquidity, and fiscal flows — structured and               │   │
│  │  contextualized in one Bloomberg-style dashboard.           │   │
│  │                                                (body-lg)    │   │
│  │                                                             │   │
│  │  [▶ Open Dashboard — Free]    [See Features ↓]              │   │
│  │                                                             │   │
│  │  ┌ HERO STATS (3 columns) ──────────────────────────────┐   │   │
│  │  │  NATIONAL DEBT        NET LIQUIDITY      DEFICIT/YR  │   │   │
│  │  │  $36.218T             $5.89T             -$1.83T     │   │   │
│  │  │  +$4.7B today         ▼ $42B this week   FY2026 YTD  │   │   │
│  │  │  ● LIVE               ● 1H AGO           ● DAILY     │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ WHAT POWERS THIS ──────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  DATA SOURCES               COVERAGE          UPDATE FREQ  │   │
│  │  U.S. Treasury              National Debt      Daily        │   │
│  │  Federal Reserve (FRED)     Fed Operations     Weekly       │   │
│  │  FiscalData.gov             Fiscal Flows       Monthly      │   │
│  │  Congressional Budget Off.  Projections        Quarterly    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ FOUR PILLARS (2x2 grid) ──────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐          │   │
│  │  │ 🏛 NATIONAL DEBT    │  │ 💧 LIQUIDITY & FED  │          │   │
│  │  │                     │  │                     │          │   │
│  │  │ Total public debt,  │  │ Fed balance sheet,  │          │   │
│  │  │ debt composition,   │  │ TGA, reverse repo,  │          │   │
│  │  │ growth trajectory,  │  │ net liquidity       │          │   │
│  │  │ auction results     │  │ formula, M2         │          │   │
│  │  │                     │  │                     │          │   │
│  │  │ • Debt outstanding  │  │ • Net Liq = BS-TGA  │          │   │
│  │  │ • Debt-to-GDP       │  │ • QT tracking       │          │   │
│  │  │ • Daily changes     │  │ • Reserve balances   │          │   │
│  │  │                     │  │                     │          │   │
│  │  │ Explore →           │  │ Explore →           │          │   │
│  │  └─────────────────────┘  └─────────────────────┘          │   │
│  │                                                             │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐          │   │
│  │  │ 📊 FISCAL FLOWS     │  │ 📈 DOLLAR & MARKETS │          │   │
│  │  │                     │  │                     │          │   │
│  │  │ Federal receipts,   │  │ DXY, Treasury       │          │   │
│  │  │ outlays, deficit,   │  │ yields, yield       │          │   │
│  │  │ spending by dept,   │  │ curve, inflation    │          │   │
│  │  │ interest expense    │  │ indicators          │          │   │
│  │  │                     │  │                     │          │   │
│  │  │ Explore →           │  │ Explore →           │          │   │
│  │  └─────────────────────┘  └─────────────────────┘          │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ DIFFERENTIATORS (3 col) ───────────────────────────────────┐   │
│  │  CONNECTED       NON-PARTISAN      PREMIUM                  │   │
│  │  DATA            & DATA-DRIVEN     DATA DENSITY             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ CTA ───────────────────────────────────────────────────────┐   │
│  │  Start tracking the dollar system. Free to explore.         │   │
│  │  [Open Dashboard →]                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ FOOTER ────────────────────────────────────────────────────┐   │
│  │  [$] TrackTheDollar    Data sources: Treasury, Fed, FRED    │   │
│  │  © 2026               [Methodology] [Privacy] [Terms]       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Wireframe (Detailed)

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR        │ TOPBAR: Dashboard — U.S. Dollar System Overview    │
│ (240px)        │                          [Refresh] Updated 2:14 PM │
│                ├────────────────────────────────────────────────────┤
│ [$] TrackThe$  │                                                    │
│                │ ┌─ TICKER STRIP (scrolling) ──────────────────┐   │
│ ◉ Dashboard    │ │ DEBT $36.2T ▲ │ FED BS $6.8T │ TGA $782B   │   │
│ ○ Nat'l Debt   │ └────────────────────────────────────────────────┘ │
│ ○ Liquidity    │                                                    │
│ ○ Fiscal       │ ┌─ WHAT CHANGED TODAY ───────────────────────┐    │
│ ○ Markets      │ │                                             │    │
│ ○ Alerts       │ │ ▲ National debt increased $4.7B yesterday   │    │
│                │ │ ▼ Fed balance sheet declined $12B (QT)      │    │
│ ──────         │ │ ● TGA refilled to $782B after auction       │    │
│ ○ Settings     │ │ ▼ Reverse repo dropped to $147B (new low)   │    │
│ ◀ Collapse     │ │                                             │    │
│                │ └─────────────────────────────────────────────┘    │
│                │                                                    │
│                │ ┌─ DOLLAR SYSTEM VITALS (5 col) ─────────────┐    │
│                │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────────┐    │    │
│                │ │ │DEBT│ │FED │ │TGA │ │RRP │ │NET LIQ │    │    │
│                │ │ │    │ │ BS │ │    │ │    │ │        │    │    │
│                │ │ │$36T│ │$6.8│ │$782│ │$147│ │ $5.89T │    │    │
│                │ │ │▲4.7│ │▼12B│ │    │ │▼3B │ │        │    │    │
│                │ │ └────┘ └────┘ └────┘ └────┘ └────────┘    │    │
│                │ └─────────────────────────────────────────────┘    │
│                │                                                    │
│                │ ┌─ RATES & YIELDS (4 col) ───────────────────┐    │
│                │ │ FED FUNDS    10Y YIELD   2Y YIELD   CURVE  │    │
│                │ │ 4.33%        4.32%       4.15%      +0.17  │    │
│                │ └─────────────────────────────────────────────┘    │
│                │                                                    │
│                │ ┌─ AI BRIEFING ──────────────────────────────┐    │
│                │ │ 📋 Daily Intelligence Summary               │    │
│                │ │                                             │    │
│                │ │ The Treasury added $4.7B to the national    │    │
│                │ │ debt yesterday, bringing the total to       │    │
│                │ │ $36.218T. The Fed continued QT, reducing    │    │
│                │ │ its balance sheet by $12B. Notably, the     │    │
│                │ │ reverse repo facility hit a new cycle low   │    │
│                │ │ of $147B, suggesting money market funds     │    │
│                │ │ are deploying cash elsewhere...             │    │
│                │ │                                             │    │
│                │ │ Sources: Treasury.gov, FRED, FiscalData     │    │
│                │ │ Generated: Mar 14, 2026 06:00 AM ET        │    │
│                │ └─────────────────────────────────────────────┘    │
│                │                                                    │
│                │ ┌─ EVENT FEED ───────────────────────────────┐    │
│                │ │ Mar 14  Treasury 10Y auction: 4.32%, 2.4x  │    │
│                │ │ Mar 13  Debt ceiling reinstated             │    │
│                │ │ Mar 12  CPI print: 3.1% YoY                │    │
│                │ │ Mar 11  Fed balance sheet: -$12B (QT)      │    │
│                │ │ Mar 10  Monthly Treasury Statement released │    │
│                │ └─────────────────────────────────────────────┘    │
│                │                                                    │
│                │ ┌─ EXPLORE (4 nav cards) ────────────────────┐    │
│                │ │ [Debt] [Liquidity] [Fiscal] [Markets]      │    │
│                │ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Animation & Transition Rules

### Allowed Animations

1. **Sidebar collapse/expand**: 200ms ease-out, width + margin transition
2. **Card hover**: 150ms border-color transition, no transform (data shouldn't move)
3. **Ticker scroll**: 45s linear infinite, pauses on hover
4. **Value change flash**: brief background pulse (green or red), 800ms, once
5. **Page transitions**: 150ms fade-in with 4px translateY
6. **Tooltip appear**: 100ms opacity transition
7. **Loading skeleton**: subtle pulse animation (opacity 0.4 → 0.7)
8. **Status dot pulse**: gentle 2s ease-in-out for live indicators

### Forbidden Animations

- No bouncing or spring physics (too playful)
- No parallax scrolling (distracting from data)
- No count-up animations on numbers (implies imprecision)
- No slide-in panels from edges (feels like a mobile app)
- No confetti or celebration animations (this is serious data)
- No hover transforms on data cards (translateY, scale — data shouldn't move)
- No animated gradients or aurora effects (looks crypto/web3)

### Transition Timing

```
Micro (focus, active):    100ms
Standard (hover, toggle): 150ms
Layout (sidebar, panels):  200ms
Content (page transition):  150ms
```

---

## Making It Feel Venture-Scale

### 1. Source Transparency on Everything
Every number shows: value + change + source + timestamp. Nothing appears unsourced.
```
$36.218T
+$4.7B today
● Treasury FiscalData API · Updated 2h ago
```

### 2. Confidence Indicators
Small colored dots next to each metric:
- 🟢 Green: Live / updated within last hour
- 🟡 Yellow: Updated 1-24 hours ago
- 🔴 Red: Stale / >24 hours
- ⚪ Gray: Static / calculated

### 3. Net Liquidity Formula as a First-Class Visualization
The formula `Net Liq = Fed BS − TGA − RRP` is displayed as a live, interactive equation with each variable linked to its detail page. This is the signature visualization.

### 4. "What Changed Today" Section
A curated list of the most important daily changes. Not a generic feed — each item is a structured delta: metric name, direction, magnitude, context.

### 5. AI Briefing with Citations
AI summaries always cite specific data points. Never free-floating commentary. Each claim links to the underlying metric.

### 6. Professional Empty States
No sad-face illustrations. Empty states show the data structure with skeleton shapes, communicating "this space will have data" rather than "something is wrong."

### 7. Methodology Page
A dedicated `/methodology` page explaining every data source, update frequency, calculation method, and known limitations. This is what separates a serious platform from a dashboard template.

### 8. Consistent Visual Rhythm
Every dashboard page follows the same structure:
1. Section label (uppercase, tracking-wider)
2. Metric card grid (key numbers)
3. Primary chart (hero visualization)
4. Detail table or breakdown
5. Source citation footer

This predictable rhythm lets users learn the system once and navigate fluently.
