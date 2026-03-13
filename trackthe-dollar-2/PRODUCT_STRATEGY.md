# TrackTheDollar — Product Strategy & Architecture

## Executive Product Summary

**TrackTheDollar** is a premium, institutional-grade macro intelligence platform that tracks the U.S. dollar ecosystem — from Treasury borrowing and national debt mechanics to Fed liquidity operations and fiscal flow analysis. It serves as the "Bloomberg Terminal for the dollar system" — built for the public internet but designed with the depth, rigor, and data density that professionals demand.

Unlike generic financial dashboards or political debt clocks, TrackTheDollar provides **structured, contextualized, forward-looking intelligence** on how dollars move through the federal government, the Federal Reserve, and into the real economy.

**TrackTheInternet.com** operates as the backend intelligence and data orchestration engine — the monitoring, ingestion, and processing layer that powers the TrackTheDollar product.

---

## Product Pillars

### 1. The Debt Machine
Track the national debt not as a scare number, but as a structured system:
- Total public debt outstanding (daily Treasury updates)
- Debt composition: marketable vs. non-marketable, maturity profile
- Net new borrowing pace vs. projections
- Debt-to-GDP ratio with historical context
- Treasury auction results and calendar
- Debt ceiling status and X-date modeling

### 2. The Liquidity Map
Visualize where dollars are flowing in the financial system:
- Fed balance sheet (WALCL) — QT pace, composition
- Treasury General Account (TGA) — government cash balance
- Reverse Repo Facility (RRP) — money market parking
- Net liquidity formula: Fed Balance Sheet - TGA - RRP
- Bank reserves and deposit trends
- Commercial paper and credit conditions

### 3. Fiscal Flows
Track federal money in and out in near real-time:
- Monthly Treasury Statement receipts and outlays
- Daily Treasury Statement cash position
- Budget deficit: actual vs. CBO projections
- Spending by category (defense, social security, interest, healthcare)
- Revenue by source (individual, corporate, payroll, customs)
- Interest expense trajectory (the fastest-growing budget item)

### 4. Dollar Strength & Global Position
- DXY (Dollar Index) with macro overlays
- USD vs. major currency pairs
- Foreign holdings of U.S. Treasuries (TIC data)
- Global reserve currency share trends
- Trade-weighted dollar indices

### 5. AI Intelligence Layer
- AI-generated daily briefings on key moves
- Natural language summaries of Treasury statements
- Anomaly detection (unusual spending spikes, revenue drops)
- Scenario modeling (what happens if rates stay at X, deficit hits Y)
- Research note generation for subscribers

---

## User Personas

### 1. The Macro Strategist (Primary)
**Who:** Portfolio managers, macro hedge fund analysts, macro-focused RIAs
**Need:** Consolidated view of fiscal/monetary data that takes hours to manually compile
**Value prop:** "I can see the full dollar liquidity picture in 30 seconds"
**Tier:** Pro ($29/mo) or Enterprise ($99/mo)

### 2. The Informed Citizen (Growth Engine)
**Who:** Financially literate individuals who follow macro but aren't professionals
**Need:** Understand national debt, spending, and Fed policy without political spin
**Value prop:** "Finally, a non-partisan, data-driven view of government finances"
**Tier:** Free or Pro ($29/mo)

### 3. The Financial Content Creator
**Who:** FinTwit, YouTube, Substack macro commentators
**Need:** Professional charts and data for content, embeddable visualizations
**Value prop:** "Bloomberg-quality charts I can screenshot and embed"
**Tier:** Pro ($29/mo)

### 4. The Institutional Research Team
**Who:** Banks, think tanks, policy organizations, journalists
**Need:** API access, bulk data, custom dashboards, team seats
**Value prop:** "Single source of truth for U.S. fiscal and monetary data"
**Tier:** Enterprise ($99/mo) or custom

---

## Site Map

```
TrackTheDollar.com
├── / (Landing page — hero + live ticker + key metrics)
├── /dashboard (Authenticated home — full macro overview)
│   ├── Command bar (quick search, navigation)
│   ├── Key metrics ticker strip
│   ├── Debt overview panel
│   ├── Liquidity panel
│   ├── Fiscal snapshot panel
│   └── AI briefing panel
├── /debt (National Debt Deep Dive)
│   ├── Total debt + trajectory
│   ├── Debt composition breakdown
│   ├── Treasury auction calendar + results
│   ├── Debt ceiling tracker
│   └── Debt-to-GDP historical
├── /liquidity (Fed & Liquidity)
│   ├── Fed balance sheet tracker
│   ├── TGA balance
│   ├── Reverse repo
│   ├── Net liquidity formula
│   ├── Bank reserves
│   └── Fed rate + dot plot
├── /fiscal (Fiscal Flows)
│   ├── Receipts vs outlays
│   ├── Budget deficit tracker
│   ├── Spending by category
│   ├── Revenue by source
│   ├── Interest expense
│   └── CBO projection comparison
├── /dollar (Dollar & Global)
│   ├── DXY tracker
│   ├── Currency pairs
│   ├── Foreign Treasury holdings
│   └── Reserve currency status
├── /research (AI Research & Briefings)
│   ├── Daily briefing
│   ├── Weekly digest
│   ├── Research notes archive
│   └── Scenario builder
├── /alerts (Custom alert configuration)
├── /settings (Account, billing, API keys)
├── /pricing (Plan comparison)
└── /api/v1/ (Public API for Enterprise)
```

---

## MVP Feature List (Phase 1 — Weeks 1-6)

### Data Feeds (via FRED, Treasury.gov, FiscalData API)
- [x] Fed Funds Rate, CPI, unemployment (existing)
- [x] Fed Balance Sheet / WALCL (existing)
- [x] M2 Money Supply (existing)
- [x] Treasury yields + yield curve (existing)
- [ ] Total public debt outstanding (GFDEBTN / Treasury)
- [ ] TGA balance (Treasury Daily Statement)
- [ ] Reverse repo (RRPONTSYD)
- [ ] Federal receipts & outlays (Monthly Treasury Statement)
- [ ] DXY / Dollar Index

### Pages
- [ ] Dashboard overview with key metric cards
- [ ] Debt tracker page (total debt, trajectory, composition)
- [ ] Liquidity page (Fed BS, TGA, RRP, net liquidity)
- [ ] Fiscal flows page (receipts, outlays, deficit)
- [ ] Pricing page

### Components
- [ ] App shell (sidebar + topbar)
- [ ] Metric card (value + change + sparkline)
- [ ] Time series chart (recharts, dark themed)
- [ ] Data table with sorting
- [ ] Ticker strip (top of page)
- [ ] AI briefing card (placeholder)

### Infrastructure
- [x] Auth (NextAuth v5)
- [x] Stripe billing
- [x] FRED API client
- [x] Redis caching
- [x] PostgreSQL + Prisma
- [ ] Treasury/FiscalData API client
- [ ] Scheduled data refresh (cron or Vercel)

---

## Phase 2 Roadmap (Weeks 7-14)

- Treasury auction calendar with results overlay
- Debt ceiling status and X-date projections
- Spending by agency + category drill-down
- Contract/grant/loan explorer (USASpending API)
- AI daily briefing generation (Claude API)
- Embeddable chart widgets (for content creators)
- Email digest (weekly summary)
- Advanced alerts (threshold + rate-of-change)
- DXY page with currency pairs
- Foreign Treasury holdings (TIC data)
- Mobile-optimized responsive layouts
- Share/export chart as image

## Phase 3 Roadmap (Weeks 15-24)

- Public REST API (Enterprise tier)
- Scenario builder (what-if modeling)
- Custom dashboard builder (drag-and-drop panels)
- Team workspaces (Enterprise)
- Webhook integrations (Slack, Discord, email)
- Historical data archive (full downloadable datasets)
- Research note generator (AI-powered)
- Congressional budget tracking
- State-level fiscal data
- Institutional onboarding flow
- White-label API for fintech partners

---

## Tech Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TrackTheDollar.com                            │
│              (Next.js 14 — App Router, RSC)                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │Dashboard │  │  Debt    │  │Liquidity │  │  Fiscal Flows │   │
│  │ Overview │  │ Tracker  │  │  & Fed   │  │  & Spending   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘   │
│       │              │             │                │            │
│  ┌────┴──────────────┴─────────────┴────────────────┴────────┐  │
│  │              API Layer (Next.js Route Handlers)            │  │
│  │  /api/macro  /api/debt  /api/liquidity  /api/fiscal       │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │                   Caching Layer (Redis)                    │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│              TrackTheInternet.com (Backend Engine)               │
│                                                                 │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │              Data Ingestion & Orchestration                │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   FRED   │  │ Treasury │  │ Fiscal   │  │  Market  │  │  │
│  │  │   API    │  │ .gov API │  │ Data API │  │  Data    │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │USASpend  │  │  CBO     │  │  Claude  │               │  │
│  │  │  API     │  │ Projctns │  │  AI API  │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL  +  Time-series Storage              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Scheduled Jobs (Cron / Vercel / Inngest)            │  │
│  │   • Hourly: TGA, RRP, market data                        │  │
│  │   • Daily: Treasury statements, debt totals              │  │
│  │   • Weekly: AI briefing generation                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technology Choices
- **Frontend:** Next.js 14 (App Router, React Server Components)
- **Styling:** Tailwind CSS + shadcn/ui primitives (already configured)
- **Charts:** Recharts (already installed) — lightweight, React-native
- **State:** Zustand (already installed) + TanStack Query (already installed)
- **Auth:** NextAuth v5 (already configured)
- **Database:** PostgreSQL via Prisma (already configured)
- **Cache:** Redis via Upstash (already configured)
- **Payments:** Stripe (already configured)
- **AI:** Claude API (Phase 2)
- **Data Sources:** FRED API, Treasury FiscalData API, USASpending API

---

## UX & Branding Direction

### Visual Language
- **Dark-first** — Bloomberg terminal aesthetic, not "dark mode as afterthought"
- **Data density** — more data per screen than a typical SaaS, but elegantly organized
- **Monospace numbers** — tabular figures for all financial data (already configured)
- **Gold accent** (#F0B429) — dollar/gold association, premium feel
- **Green/Red** — standard financial positive/negative indicators
- **Panel-based layout** — modular cards that feel like terminal windows

### Tagline Options (Ranked)
1. **"The U.S. Dollar System. Tracked."** — clean, authoritative, premium
2. **"Follow Every Dollar"** — more accessible, broader appeal
3. **"Institutional Macro Intelligence for Everyone"** — aspirational positioning
4. **"Where the Dollars Go"** — curiosity-driven, content-friendly
5. **"The Macro Terminal"** — Bloomberg positioning, bold

### How to Avoid Becoming a Generic Chart Site
1. **Curated narratives, not just charts** — Every chart has context, AI-generated commentary
2. **Proprietary composite metrics** — "Net Liquidity Index", "Fiscal Impulse Score"
3. **Forward projections** — Not just historical data, but where things are heading
4. **Connected data** — Show how debt issuance affects TGA affects liquidity affects markets
5. **Premium data density** — More information per pixel than competitors
6. **Opinionated defaults** — Pre-built views that tell a story vs. empty chart builders
7. **Research-grade exports** — Publication-quality charts, not Excel screenshots

---

## The Moat

1. **Data integration depth** — No single competitor connects Treasury, Fed, fiscal, and market data in one view
2. **Dollar-system specialization** — General terminals (Bloomberg, TradingView) aren't purpose-built for this lens
3. **AI intelligence layer** — Automated briefings and anomaly detection create compounding value
4. **Brand SEO** — "track the dollar" is a high-intent, low-competition search term
5. **API as platform** — Enterprise customers build on top, creating switching costs
6. **Content moat** — Research notes and briefings create organic search traffic
7. **Community** — Power users who share charts and analysis create network effects

---

## TrackTheDollar + TrackTheInternet: How They Work Together

| Aspect | TrackTheDollar.com | TrackTheInternet.com |
|--------|-------------------|---------------------|
| **Role** | Public product, user-facing | Backend engine, data layer |
| **Users** | End users, subscribers | Internal, API consumers |
| **Content** | Dashboards, charts, research | Raw data feeds, processing |
| **Brand** | Premium financial terminal | Infrastructure / developer |
| **Revenue** | SaaS subscriptions | API licensing (Phase 3) |
| **SEO** | Consumer/prosumer keywords | Developer/API keywords |

**TrackTheInternet** should be positioned as the "data intelligence engine" — it monitors government data sources, financial APIs, and public datasets, processes them, and serves them to TrackTheDollar (and eventually other clients via API). Think of it as the Palantir Foundry to TrackTheDollar's Palantir Gotham.

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data source APIs change/break | High | High | Abstract all data sources behind adapters; monitor uptime; cache aggressively |
| Free tier users never convert | High | Medium | Gate the most valuable features (AI briefings, projections, API); make free tier genuinely useful but limited |
| Bloomberg/TradingView copies features | Low | High | Move fast on dollar-specific specialization; they won't build a purpose-built fiscal data product |
| Data accuracy concerns | Medium | Very High | Show data sources, last-updated timestamps, methodology notes on every metric |
| AI hallucination in briefings | Medium | High | Ground all AI output in specific data points; show source citations; human review for published research |
| Scope creep into generic finance | Medium | Medium | Maintain strict product focus: the dollar system, period. No stock screeners, no crypto trading |
| Government data delays | High | Medium | Show "as of" dates prominently; use multiple sources for cross-validation |

---

## Recommendation

Ship the MVP with four core pages: **Dashboard, Debt, Liquidity, Fiscal**. These four views represent the unique value proposition — no other product connects these in a single, elegant interface. The existing scaffolding (auth, billing, FRED integration, dark theme) is strong. The primary work is:

1. Building the Treasury/FiscalData API client
2. Creating the dashboard layout shell
3. Implementing the four core data visualization pages
4. Deploying to production on TrackTheDollar.com

Do not build: the AI layer, the API product, the content/research section, or TrackTheInternet.com in Phase 1. Those are Phase 2-3 investments that depend on having real users and validated demand.
