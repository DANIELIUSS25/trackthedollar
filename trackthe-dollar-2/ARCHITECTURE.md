# TrackTheDollar + TrackTheInternet — Technical Architecture

> Production systems architecture for a scalable data intelligence platform that ingests official government and financial datasets, normalizes them, stores time-series data, powers a premium frontend, and uses AI to generate explainers, alerts, and research summaries.

---

## Table of Contents

1. [Full Stack Recommendation](#1-full-stack-recommendation)
2. [Database Schema Design](#2-database-schema-design)
3. [Time-Series Data Handling](#3-time-series-data-handling)
4. [ETL / Ingestion Architecture](#4-etl--ingestion-architecture)
5. [Job Scheduling](#5-job-scheduling)
6. [Caching Strategy](#6-caching-strategy)
7. [Search Architecture](#7-search-architecture)
8. [Alerting Engine](#8-alerting-engine)
9. [AI Summarization Pipeline](#9-ai-summarization-pipeline)
10. [API Architecture (Paid Access)](#10-api-architecture-paid-access)
11. [Auth & Billing Architecture](#11-auth--billing-architecture)
12. [Admin Panel Architecture](#12-admin-panel-architecture)
13. [Observability, Monitoring & Logging](#13-observability-monitoring--logging)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security Best Practices](#15-security-best-practices)
16. [TrackTheInternet as Backend Intelligence Layer](#16-tracktheinternet-as-backend-intelligence-layer)

---

## 1. Full Stack Recommendation

### Frontend — TrackTheDollar.com

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14** (App Router) | RSC for SEO pages, client components for interactive dashboards |
| Language | **TypeScript** (strict) | End-to-end type safety with shared types |
| Styling | **Tailwind CSS** + CSS variables | Design token system already implemented |
| Charts | **Recharts** (current) → **Tremor** or **Nivo** for advanced | Recharts adequate for MVP; migrate for heatmaps/treemaps later |
| State | **Zustand** (UI) + **TanStack Query** (server) | Already in place; minimal boilerplate |
| Auth | **NextAuth v5** (JWT strategy) | Already configured with Google/GitHub OAuth |
| Billing | **Stripe** (Checkout + Customer Portal) | Already integrated |
| Error Tracking | **Sentry** | Already in dependencies |

### Backend — TrackTheInternet.com (Intelligence Engine)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | **Node.js 20** (LTS) on dedicated server | Long-running jobs incompatible with serverless |
| Framework | **Fastify** | High-performance HTTP for internal API + webhooks |
| Job Queue | **BullMQ** + **Redis** (Upstash or self-hosted) | Reliable job scheduling, retries, rate limiting |
| ORM | **Prisma** (shared schema) | Same models, different connection string |
| AI | **Perplexity API** + **Claude API** | Perplexity for research synthesis, Claude for structured analysis |
| Caching | **Upstash Redis** (shared) | REST-compatible, works across both services |

### Infrastructure

| Component | Service | Notes |
|-----------|---------|-------|
| Database | **Neon PostgreSQL** (serverless) or **Supabase** | Connection pooling via PgBouncer, branching for dev |
| Time-Series Extension | **TimescaleDB** (self-hosted PG) or **pg partitioning** | Hypertables for high-cardinality series; see §3 |
| Cache | **Upstash Redis** | REST API, Edge-compatible |
| File Storage | **Cloudflare R2** or **S3** | Report PDFs, data exports, backup dumps |
| CDN | **Vercel Edge Network** | Automatic for Next.js deployment |
| DNS | **Cloudflare** | DDoS protection, analytics |
| CI/CD | **GitHub Actions** | Lint → Test → Build → Deploy pipeline |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USERS / BROWSERS                             │
│                    (Free / Pro / Enterprise)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     TrackTheDollar.com                               │
│                     (Next.js on Vercel)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  RSC      │  │  API     │  │ Middleware│  │  Stripe Webhooks │   │
│  │  Pages    │  │  Routes  │  │ (Auth)   │  │  (Billing)       │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────────────┘   │
│       │              │                                               │
│       ▼              ▼                                               │
│  ┌─────────────────────────┐                                        │
│  │    Upstash Redis Cache   │◄──── stale-while-revalidate           │
│  └─────────────┬───────────┘                                        │
│                │ cache miss                                          │
│                ▼                                                     │
│  ┌─────────────────────────┐                                        │
│  │    PostgreSQL (Neon)     │◄──── Prisma ORM                       │
│  │    + TimescaleDB ext     │                                        │
│  └─────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
                             ▲
                             │ Internal API / Shared DB
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TrackTheInternet.com                              │
│                    (Fastify on Railway/Fly)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Scheduler │  │  ETL     │  │ Alert    │  │  AI Summary      │   │
│  │ (BullMQ)  │  │ Workers  │  │ Engine   │  │  Pipeline        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────────┘   │
│       │              │              │               │               │
│       ▼              ▼              ▼               ▼               │
│  ┌────────┐   ┌────────────┐  ┌─────────┐   ┌──────────────┐      │
│  │ Redis  │   │ Treasury   │  │ Notify  │   │ Perplexity   │      │
│  │ Queue  │   │ FRED APIs  │  │ Email/  │   │ Claude API   │      │
│  └────────┘   │ USAspend   │  │ Push    │   └──────────────┘      │
│               └────────────┘  └─────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Design

### Core Principle
The existing Prisma schema handles **users, auth, billing, portfolios, and alerts**. We extend it with three new domains:

1. **Time-Series Storage** — normalized observation tables for all ingested data
2. **Ingestion Metadata** — tracking what was fetched, when, and its status
3. **AI Content** — generated summaries, briefings, research notes

### New Models

```prisma
// ─── Data Series Registry ────────────────────────────────────────

model DataSeries {
  id          String   @id // e.g., "FRED:WALCL", "TREASURY:DEBT_TO_PENNY"
  source      String   // "FRED" | "TREASURY" | "FISCAL" | "CALCULATED"
  name        String   // Human-readable name
  description String?  @db.Text
  units       String   // "$", "%", "Index", "Mil $", "Bil $"
  frequency   String   // "daily" | "weekly" | "monthly" | "quarterly"
  apiEndpoint String?  @db.Text  // Full API URL for re-fetching
  metadata    Json?    // Source-specific metadata
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  observations Observation[]
  ingestionLog IngestionLog[]

  @@index([source])
  @@map("data_series")
}

// ─── Time-Series Observations ────────────────────────────────────

model Observation {
  id       String   @id @default(cuid())
  seriesId String
  date     DateTime @db.Date
  value    Decimal  @db.Decimal(24, 8)
  vintage  DateTime @default(now()) // When this value was published

  series DataSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)

  @@unique([seriesId, date, vintage])
  @@index([seriesId, date(sort: Desc)])
  @@index([date])
  @@map("observations")
}

// ─── Daily Snapshots (Denormalized for Dashboard) ────────────────

model DailySnapshot {
  id                String   @id @default(cuid())
  date              DateTime @db.Date @unique
  totalDebt         Decimal? @db.Decimal(24, 2)
  debtHeldByPublic  Decimal? @db.Decimal(24, 2)
  intragovHoldings  Decimal? @db.Decimal(24, 2)
  tgaBalance        Decimal? @db.Decimal(24, 2)
  fedBalanceSheet   Decimal? @db.Decimal(24, 2)
  rrpBalance        Decimal? @db.Decimal(24, 2)
  netLiquidity      Decimal? @db.Decimal(24, 2) // Calculated: FedBS - TGA - RRP
  fedFundsRate      Decimal? @db.Decimal(8, 4)
  dgs10             Decimal? @db.Decimal(8, 4)
  dgs2              Decimal? @db.Decimal(8, 4)
  yieldCurve        Decimal? @db.Decimal(8, 4)
  m2                Decimal? @db.Decimal(24, 2)
  cpi               Decimal? @db.Decimal(12, 4)
  createdAt         DateTime @default(now())

  @@index([date(sort: Desc)])
  @@map("daily_snapshots")
}

// ─── Ingestion Tracking ──────────────────────────────────────────

model IngestionLog {
  id         String   @id @default(cuid())
  seriesId   String?
  jobName    String
  status     String   // "running" | "success" | "failed" | "skipped"
  startedAt  DateTime @default(now())
  finishedAt DateTime?
  duration   Int?     // milliseconds
  recordsIn  Int?     // rows fetched from source
  recordsOut Int?     // rows written to DB (after dedup)
  error      String?  @db.Text
  metadata   Json?

  series DataSeries? @relation(fields: [seriesId], references: [id])

  @@index([jobName, startedAt(sort: Desc)])
  @@index([status])
  @@map("ingestion_logs")
}

// ─── Monthly Fiscal Data ─────────────────────────────────────────

model MonthlyFiscal {
  id              String   @id @default(cuid())
  fiscalYear      Int
  month           Int      // 1-12
  date            DateTime @db.Date
  totalReceipts   Decimal  @db.Decimal(24, 2)
  totalOutlays    Decimal  @db.Decimal(24, 2)
  deficit         Decimal  @db.Decimal(24, 2) // Negative = deficit
  interestExpense Decimal? @db.Decimal(24, 2)
  createdAt       DateTime @default(now())

  @@unique([fiscalYear, month])
  @@index([date(sort: Desc)])
  @@map("monthly_fiscal")
}

// ─── Spending & Revenue Categories ───────────────────────────────

model FiscalCategory {
  id           String   @id @default(cuid())
  fiscalYear   Int
  month        Int
  type         String   // "spending" | "revenue"
  category     String   // e.g., "Defense", "Social Security", "Individual Income Taxes"
  amount       Decimal  @db.Decimal(24, 2)
  priorYear    Decimal? @db.Decimal(24, 2) // Same period prior year
  yoyChange    Decimal? @db.Decimal(12, 4) // Percentage
  createdAt    DateTime @default(now())

  @@unique([fiscalYear, month, type, category])
  @@index([fiscalYear, type])
  @@map("fiscal_categories")
}

// ─── Treasury Auction Results ────────────────────────────────────

model AuctionResult {
  id             String   @id @default(cuid())
  auctionDate    DateTime @db.Date
  securityType   String   // "Bill", "Note", "Bond", "TIPS", "FRN"
  securityTerm   String   // "4-Week", "10-Year", etc.
  cusip          String?
  highYield      Decimal? @db.Decimal(8, 4)
  bidToCover     Decimal? @db.Decimal(8, 4)
  allotPctDirect Decimal? @db.Decimal(8, 4)
  allotPctIndirect Decimal? @db.Decimal(8, 4)
  allotPctPrimary  Decimal? @db.Decimal(8, 4)
  awardAmount    Decimal? @db.Decimal(24, 2)
  metadata       Json?
  createdAt      DateTime @default(now())

  @@unique([auctionDate, cusip])
  @@index([auctionDate(sort: Desc)])
  @@index([securityType])
  @@map("auction_results")
}

// ─── AI-Generated Content ────────────────────────────────────────

model AISummary {
  id          String   @id @default(cuid())
  type        String   // "daily_briefing" | "metric_explainer" | "alert_context" | "research_note"
  scope       String   // "dashboard" | "debt" | "liquidity" | "fiscal" | "market"
  title       String
  content     String   @db.Text
  dataSources Json     // Array of series IDs and values referenced
  model       String   // "perplexity-sonar-pro" | "claude-sonnet-4-20250514"
  confidence  Decimal  @db.Decimal(4, 2) // 0.00 - 1.00
  validFrom   DateTime
  validUntil  DateTime
  publishedAt DateTime?
  createdAt   DateTime @default(now())

  @@index([type, scope, validFrom(sort: Desc)])
  @@index([publishedAt])
  @@map("ai_summaries")
}

// ─── User Notification Preferences ───────────────────────────────

model NotificationPreference {
  id          String   @id @default(cuid())
  userId      String
  channel     String   // "email" | "push" | "webhook"
  category    String   // "alert_triggered" | "daily_briefing" | "data_anomaly"
  enabled     Boolean  @default(true)
  config      Json?    // Channel-specific config (webhook URL, etc.)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, channel, category])
  @@index([userId])
  @@map("notification_preferences")
}
```

### Entity Relationship Summary

```
User ──┬── Subscription (1:1)
       ├── Portfolio ──── Holding (1:N)
       ├── PriceAlert (1:N)
       └── NotificationPreference (1:N)

DataSeries ──┬── Observation (1:N)        ← Normalized time-series
             └── IngestionLog (1:N)       ← ETL audit trail

DailySnapshot (standalone)                ← Denormalized dashboard cache
MonthlyFiscal (standalone)                ← Monthly fiscal aggregates
FiscalCategory (standalone)               ← Spending/revenue breakdowns
AuctionResult (standalone)                ← Treasury auction history
AISummary (standalone)                    ← AI-generated content
```

---

## 3. Time-Series Data Handling

### Strategy: Hybrid Approach

We use **two complementary storage patterns**:

#### A. Normalized Observations Table (Source of Truth)
- Every data point from every source lands in `observations`
- Keyed by `(seriesId, date, vintage)` — supports data revisions
- Indexed for fast range queries: `WHERE seriesId = ? AND date BETWEEN ? AND ?`

#### B. Denormalized Daily Snapshots (Query Acceleration)
- `daily_snapshots` table joins all key metrics for a given date into one row
- Updated by ETL after each ingestion run
- Powers the dashboard and sparkline queries with a single indexed scan

### Partitioning Strategy (Production Scale)

When observation count exceeds ~10M rows:

```sql
-- Convert observations to a partitioned table (by year)
CREATE TABLE observations (
  id          TEXT PRIMARY KEY,
  series_id   TEXT NOT NULL,
  date        DATE NOT NULL,
  value       DECIMAL(24,8) NOT NULL,
  vintage     TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (date);

CREATE TABLE observations_2020 PARTITION OF observations
  FOR VALUES FROM ('2020-01-01') TO ('2021-01-01');
CREATE TABLE observations_2021 PARTITION OF observations
  FOR VALUES FROM ('2021-01-01') TO ('2022-01-01');
-- ... per year
```

Alternatively, with **TimescaleDB**:
```sql
SELECT create_hypertable('observations', 'date', chunk_time_interval => INTERVAL '1 year');
```

### Query Patterns

| Query | Table | Index Used |
|-------|-------|-----------|
| Latest value for a series | `observations` | `(seriesId, date DESC)` |
| Sparkline (last 30 days) | `daily_snapshots` | `(date DESC)` LIMIT 30 |
| Dashboard overview | `daily_snapshots` | `(date DESC)` LIMIT 1 |
| Historical chart (1Y) | `observations` | `(seriesId, date)` range scan |
| YoY comparison | `monthly_fiscal` | `(fiscalYear, month)` |

### Data Retention Policy

| Data Type | Retention | Granularity |
|-----------|-----------|-------------|
| Daily observations | Forever | Daily |
| Daily snapshots | 10 years | Daily |
| Ingestion logs | 90 days | Per-run |
| AI summaries | 1 year | Per-generation |
| Audit/access logs | 1 year | Per-request |

---

## 4. ETL / Ingestion Architecture

### Pipeline Design

Each data source gets a dedicated **ingestion worker** that follows a standard pipeline:

```
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐
│  EXTRACT  │───▶│ VALIDATE  │───▶│ TRANSFORM │───▶│   LOAD   │───▶│  SNAPSHOT  │
│ (API call)│    │ (schema)  │    │ (normalize│    │ (upsert) │    │ (denorm)   │
└──────────┘    └───────────┘    │  + clean)  │    └──────────┘    └───────────┘
                                  └───────────┘
```

### Worker Interface

```typescript
interface IngestionWorker {
  name: string;                        // "treasury-debt" | "fred-walcl" | etc.
  source: DataSourceType;              // "TREASURY" | "FRED" | "FISCAL"
  schedule: string;                    // Cron expression
  seriesIds: string[];                 // Which DataSeries this worker populates

  extract(): Promise<RawRecord[]>;     // Fetch from upstream API
  validate(raw: RawRecord[]): ValidationResult;
  transform(raw: RawRecord[]): NormalizedPoint[];
  load(points: NormalizedPoint[]): Promise<LoadResult>;
}
```

### Ingestion Workers

| Worker | Source | Series | Schedule | Estimated Records/Run |
|--------|--------|--------|----------|----------------------|
| `treasury-debt` | FiscalData API | Debt to Penny | Every hour | 1-5 rows |
| `treasury-tga` | FiscalData API | TGA Balance | Every hour | 1-5 rows |
| `treasury-mts` | FiscalData API | Monthly Treasury Statement | Daily at 06:00 UTC | 0-50 rows |
| `treasury-auctions` | FiscalData API | Auction Results | Every 4 hours | 0-10 rows |
| `fred-daily` | FRED API | DGS10, DGS2, T10Y2Y, RRPONTSYD | Every hour | 4-8 rows |
| `fred-weekly` | FRED API | WALCL | Every hour (checks Thursday) | 0-1 rows |
| `fred-monthly` | FRED API | FEDFUNDS, M2SL, CPIAUCSL | Daily at 06:00 UTC | 0-3 rows |
| `fred-quarterly` | FRED API | GDP, GFDEGDQ188S | Daily at 06:00 UTC | 0-2 rows |
| `snapshot-builder` | Internal | DailySnapshot | After each ingestion | 1 row |
| `net-liquidity` | Calculated | Net Liquidity | After fed-weekly/tga/rrp | 1 row |

### Error Handling & Retry

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  backoff: 'exponential', // 2s, 4s, 8s
  retryableErrors: [
    'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND',
    'HTTP_429', 'HTTP_500', 'HTTP_502', 'HTTP_503', 'HTTP_504',
  ],
  deadLetterQueue: 'ingestion:dead-letter',
};
```

### Deduplication

Observations use `@@unique([seriesId, date, vintage])`. The load step uses upserts:

```typescript
await prisma.observation.upsert({
  where: { seriesId_date_vintage: { seriesId, date, vintage } },
  update: { value },
  create: { seriesId, date, value, vintage },
});
```

### Data Quality Checks

After each ingestion:
1. **Staleness check** — Is the latest observation within expected freshness window?
2. **Anomaly detection** — Does the new value deviate >3σ from recent trend? (flag, don't reject)
3. **Gap detection** — Are there missing dates in daily series?
4. **Schema validation** — Does the raw response match expected shape? (Zod validation)

---

## 5. Job Scheduling

### BullMQ Queue Architecture

```
┌─────────────────────────────────────────────┐
│              Redis (BullMQ Backend)           │
│                                               │
│  Queue: ingestion:treasury    ──── Workers ×2 │
│  Queue: ingestion:fred        ──── Workers ×2 │
│  Queue: ingestion:fiscal      ──── Workers ×1 │
│  Queue: ingestion:snapshot    ──── Workers ×1 │
│  Queue: alerts:evaluate       ──── Workers ×2 │
│  Queue: ai:summarize          ──── Workers ×1 │
│  Queue: notifications:send    ──── Workers ×2 │
└─────────────────────────────────────────────┘
```

### Schedule Configuration

```typescript
const SCHEDULES = {
  // ─── High-frequency (hourly) ──────────────
  'treasury-debt':    { cron: '0 * * * *',    queue: 'ingestion:treasury' },
  'treasury-tga':     { cron: '5 * * * *',    queue: 'ingestion:treasury' },
  'fred-daily':       { cron: '10 * * * *',   queue: 'ingestion:fred' },
  'fred-weekly':      { cron: '15 * * * *',   queue: 'ingestion:fred' },

  // ─── Medium-frequency (4x daily) ─────────
  'treasury-auctions': { cron: '0 */4 * * *', queue: 'ingestion:treasury' },

  // ─── Low-frequency (daily) ────────────────
  'treasury-mts':     { cron: '0 6 * * *',    queue: 'ingestion:fiscal' },
  'fred-monthly':     { cron: '0 6 * * *',    queue: 'ingestion:fred' },
  'fred-quarterly':   { cron: '0 6 * * *',    queue: 'ingestion:fred' },

  // ─── Derived / Calculated ──────────────────
  'snapshot-builder': { cron: '30 * * * *',   queue: 'ingestion:snapshot' },
  'alert-evaluator':  { cron: '*/5 * * * *',  queue: 'alerts:evaluate' },

  // ─── AI Content ────────────────────────────
  'daily-briefing':   { cron: '0 7 * * *',    queue: 'ai:summarize' },
  'metric-explainers': { cron: '0 8 * * 1',   queue: 'ai:summarize' }, // Weekly
};
```

### Job Options

```typescript
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 100 },      // Keep last 100 completed
  removeOnFail: { count: 500 },           // Keep last 500 failed for debugging
  timeout: 60_000,                        // 1 minute max per job
};
```

### Concurrency & Rate Limiting

| Queue | Concurrency | Rate Limit | Rationale |
|-------|------------|------------|-----------|
| `ingestion:treasury` | 2 | 30/min | FiscalData rate limit |
| `ingestion:fred` | 2 | 120/min | FRED 120 req/min limit |
| `ingestion:fiscal` | 1 | 30/min | Low frequency, shared with treasury |
| `alerts:evaluate` | 2 | None | Internal only |
| `ai:summarize` | 1 | 10/min | API cost control |
| `notifications:send` | 2 | 60/min | Email provider limits |

---

## 6. Caching Strategy

### Multi-Layer Cache Architecture

```
Request ──▶ [L1: Next.js Data Cache] ──▶ [L2: Upstash Redis] ──▶ [L3: PostgreSQL]
              (ISR / RSC cache)           (withCache wrapper)        (source of truth)
```

### Layer Details

| Layer | Technology | TTL | Use Case |
|-------|-----------|-----|----------|
| **L1** | Next.js `fetch()` cache / `unstable_cache` | 60s | Static page data, SEO pages |
| **L2** | Upstash Redis (existing `withCache`) | 1h-24h | API route responses, computed metrics |
| **L3** | PostgreSQL | Permanent | Raw observations, historical data |
| **L0** | Browser (React Query) | 15s-5m | Client-side freshness |

### Cache Key Convention

```
ttd:{domain}:{resource}:{params}

Examples:
  ttd:overview:latest                    # Dashboard overview
  ttd:debt:snapshot:latest               # Latest debt snapshot
  ttd:debt:history:30d                   # 30-day debt history
  ttd:fred:WALCL:latest                  # Latest Fed balance sheet
  ttd:liquidity:net:latest               # Net liquidity calculation
  ttd:fiscal:mts:2025-01                 # January 2025 MTS
  ttd:auctions:recent:10                 # Last 10 auctions
  ttd:ai:briefing:dashboard:2025-03-14   # Today's AI briefing
```

### TTL Strategy by Data Freshness

| Data Category | Redis TTL | SWR | React Query staleTime |
|---------------|-----------|-----|----------------------|
| Daily metrics (debt, TGA, yields) | 1 hour | Yes | 30s |
| Weekly metrics (Fed BS) | 1 hour | Yes | 30s |
| Monthly metrics (CPI, M2, MTS) | 24 hours | Yes | 5 min |
| Quarterly metrics (GDP, Debt/GDP) | 24 hours | No | 5 min |
| AI summaries | 12 hours | Yes | 5 min |
| Auction results | 4 hours | Yes | 1 min |
| Static reference data | 7 days | No | 1 hour |

### Cache Invalidation

```typescript
// Invalidate on successful ingestion
async function onIngestionComplete(seriesId: string) {
  const patterns = getCacheKeysForSeries(seriesId);
  await Promise.all(patterns.map(key => redisDel(key)));
}

// Example: Treasury debt ingestion invalidates
// ttd:overview:latest, ttd:debt:snapshot:latest, ttd:debt:history:*
```

---

## 7. Search Architecture

### Phase 1: PostgreSQL Full-Text Search (MVP)

No external search engine needed initially. PostgreSQL's built-in full-text search handles the search volume.

```sql
-- Add search columns to relevant tables
ALTER TABLE data_series ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;

ALTER TABLE ai_summaries ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED;

CREATE INDEX idx_data_series_search ON data_series USING GIN(search_vector);
CREATE INDEX idx_ai_summaries_search ON ai_summaries USING GIN(search_vector);
```

### Search API

```typescript
// GET /api/search?q=treasury+yield&type=series,summaries&limit=20

interface SearchResult {
  type: 'series' | 'summary' | 'auction' | 'page';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  href: string;
}
```

### Phase 2: Typesense (Scale)

When search queries exceed ~1000/day or we need typo tolerance / faceted search:

| Feature | PostgreSQL FTS | Typesense |
|---------|---------------|-----------|
| Typo tolerance | No | Yes |
| Faceted search | Manual | Built-in |
| Instant search (<50ms) | ~100ms | <10ms |
| Geo search | PostGIS | Built-in |
| Self-hostable | N/A | Yes |
| Cost | $0 | $0 (self-hosted) |

### Command Palette (Frontend)

The search UI uses a `⌘K` command palette pattern:
- **Series search**: "debt", "fed balance sheet", "CPI"
- **Navigation**: "go to liquidity", "open fiscal"
- **Quick stats**: "what is net liquidity today"
- **Actions**: "set alert on DGS10 > 5%"

---

## 8. Alerting Engine

### Architecture Overview

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐     ┌────────────┐
│  Ingestion   │────▶│ Alert Queue   │────▶│  Evaluator   │────▶│  Notifier  │
│  Complete    │     │ (BullMQ)      │     │  Worker      │     │  Worker    │
└──────────────┘     └───────────────┘     └──────────────┘     └────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │  PostgreSQL   │
                                           │  (alerts +    │
                                           │   history)    │
                                           └──────────────┘
```

### Alert Types

| Type | Condition | Example |
|------|----------|---------|
| **Threshold** | Value crosses above/below target | "Alert me when DGS10 > 5%" |
| **Percent Change** | Value changes by ±X% | "Alert when debt increases >0.5% in a day" |
| **Anomaly** | Value deviates >Nσ from trend | "Alert on unusual TGA movements" |
| **Staleness** | Data not updated within expected window | "Alert if FRED data is >48h stale" |
| **Composite** | Formula-based condition | "Alert when net liquidity < $5T" |

### Extended Alert Model

```typescript
interface AlertRule {
  id: string;
  userId: string;
  name: string;
  seriesId: string;          // Which data series to monitor
  condition: AlertCondition;  // above | below | percent_change_up | percent_change_down | anomaly
  targetValue: number;
  windowMinutes?: number;     // For rate-of-change alerts
  cooldownMinutes: number;    // Min time between re-triggers (default: 60)
  channels: NotifyChannel[];  // email | push | webhook
  status: 'active' | 'triggered' | 'paused' | 'expired';
  lastEvaluatedAt?: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
}
```

### Evaluation Logic

```typescript
async function evaluateAlerts() {
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { status: 'active' },
    include: { user: { select: { email: true, role: true } } },
  });

  for (const alert of activeAlerts) {
    const latestValue = await getLatestValue(alert.symbol);
    if (!latestValue) continue;

    const triggered = checkCondition(alert.condition, latestValue, alert.targetValue);
    if (!triggered) continue;

    // Check cooldown
    if (alert.triggeredAt) {
      const cooldown = alert.cooldownMinutes ?? 60;
      const elapsed = (Date.now() - alert.triggeredAt.getTime()) / 60_000;
      if (elapsed < cooldown) continue;
    }

    // Fire notification
    await notificationQueue.add('send', {
      alertId: alert.id,
      userId: alert.userId,
      channels: alert.notifyVia,
      payload: {
        title: `Alert: ${alert.name}`,
        message: `${alert.symbol} is now ${latestValue} (target: ${alert.condition} ${alert.targetValue})`,
        value: latestValue,
        url: `/alerts/${alert.id}`,
      },
    });

    // Update alert status
    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: { triggeredAt: new Date(), status: 'triggered' },
    });
  }
}
```

### Notification Channels

| Channel | Provider | Tier | Rate Limit |
|---------|----------|------|-----------|
| Email | **Resend** | All tiers | 100/day per user |
| Push | **Web Push API** | Pro+ | 50/day per user |
| Webhook | Custom URL | Enterprise | 500/day per user |
| Slack | Slack API | Enterprise | 100/day per workspace |

---

## 9. AI Summarization Pipeline

### Pipeline Architecture

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│ Schedule  │───▶│ Data Gather  │───▶│ AI Generate  │───▶│  Publish  │
│ (7am UTC) │    │ (latest obs) │    │ (Perplexity  │    │ (DB +     │
│           │    │              │    │  + Claude)   │    │  cache)   │
└──────────┘    └──────────────┘    └──────────────┘    └───────────┘
```

### Content Types

| Type | Frequency | Model | Max Tokens | Audience |
|------|-----------|-------|-----------|----------|
| Daily Briefing | Daily 7am UTC | Claude Sonnet | 1000 | All users |
| Metric Explainer | Weekly (Mon) | Claude Sonnet | 500 | All users |
| Research Note | On-demand | Perplexity Sonar Pro | 2000 | Pro+ |
| Alert Context | On alert trigger | Claude Haiku | 200 | Alert owner |
| Weekly Digest | Weekly (Fri) | Claude Sonnet | 1500 | Pro+ |

### Daily Briefing Generation

```typescript
async function generateDailyBriefing() {
  // 1. Gather latest data
  const snapshot = await prisma.dailySnapshot.findFirst({
    orderBy: { date: 'desc' },
  });
  const priorSnapshot = await prisma.dailySnapshot.findFirst({
    orderBy: { date: 'desc' },
    skip: 1,
  });
  const recentAuctions = await prisma.auctionResult.findMany({
    where: { auctionDate: { gte: subDays(new Date(), 7) } },
    orderBy: { auctionDate: 'desc' },
    take: 5,
  });

  // 2. Build structured context
  const context = buildBriefingContext(snapshot, priorSnapshot, recentAuctions);

  // 3. Generate with Claude
  const briefing = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: BRIEFING_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate today's macro intelligence briefing based on the following data:\n\n${JSON.stringify(context, null, 2)}`,
    }],
  });

  // 4. Store and cache
  await prisma.aISummary.create({
    data: {
      type: 'daily_briefing',
      scope: 'dashboard',
      title: `Daily Intelligence Summary — ${format(new Date(), 'MMM d, yyyy')}`,
      content: briefing.content[0].text,
      dataSources: context.sourceRefs,
      model: 'claude-sonnet-4-20250514',
      confidence: 0.85,
      validFrom: startOfDay(new Date()),
      validUntil: endOfDay(new Date()),
      publishedAt: new Date(),
    },
  });

  await redisDel('ttd:ai:briefing:dashboard:latest');
}
```

### System Prompts

```typescript
const BRIEFING_SYSTEM_PROMPT = `You are a macro intelligence analyst for TrackTheDollar.com.
Write a concise daily briefing (3-4 paragraphs) that:

1. Opens with the most significant change or development
2. Contextualizes key metrics (debt, liquidity, rates) with their trends
3. Highlights anything unusual or noteworthy from recent data
4. Closes with what to watch next (upcoming auctions, data releases)

Rules:
- ALWAYS cite specific numbers from the provided data
- NEVER make predictions or give financial advice
- Use precise language (not "soared" or "crashed" — use actual percentages)
- If a metric hasn't changed significantly, say so briefly
- Mention data freshness if any source is stale
- Write for an audience of finance professionals and macro enthusiasts`;
```

### Perplexity Integration (Research Notes)

```typescript
async function generateResearchNote(topic: string) {
  // Use Perplexity for web-sourced research synthesis
  const research = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{
        role: 'system',
        content: 'You are a macro research analyst. Synthesize recent information about the given topic, citing sources. Focus on fiscal and monetary policy implications.',
      }, {
        role: 'user',
        content: topic,
      }],
      max_tokens: 2000,
      return_citations: true,
    }),
  });

  return research.json();
}
```

### Cost Controls

| Guardrail | Implementation |
|-----------|---------------|
| Daily budget cap | Max $5/day on AI API calls; pause queue if exceeded |
| Dedup check | Don't regenerate if data hasn't changed since last summary |
| Token limits | Hard max_tokens per content type |
| Caching | Cache AI output for 12h; serve cached on repeat requests |
| Batching | Batch metric explainers into single API call with structured output |

---

## 10. API Architecture (Paid Access)

### Public API Design

```
Base URL: https://api.trackthedollar.com/v1
Auth: Bearer token (API key)
Format: JSON
Rate Limits: Per-tier (see below)
```

### Endpoints

```
GET  /v1/series                        # List all available data series
GET  /v1/series/{id}                   # Series metadata
GET  /v1/series/{id}/observations      # Time-series data with date range
GET  /v1/snapshots/latest              # Latest daily snapshot
GET  /v1/snapshots?from=&to=           # Historical snapshots
GET  /v1/debt/latest                   # Current debt metrics
GET  /v1/debt/history?range=30d        # Debt history
GET  /v1/liquidity/latest              # Net liquidity + components
GET  /v1/fiscal/latest                 # Latest fiscal data
GET  /v1/fiscal/categories             # Spending/revenue breakdown
GET  /v1/auctions?type=Note&limit=10   # Auction results
GET  /v1/summaries/latest              # Latest AI briefing
GET  /v1/health                        # API health check
```

### Rate Limiting (per tier)

| Tier | Requests/min | Requests/day | Historical Depth | Bulk Export |
|------|-------------|-------------|-----------------|------------|
| Free (no key) | 10 | 100 | 30 days | No |
| Pro ($29/mo) | 60 | 5,000 | 1 year | CSV |
| Enterprise ($99/mo) | 300 | 50,000 | Full history | CSV + JSON |

### API Key Management

```typescript
model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  name      String
  key       String   @unique // Hashed, prefix "ttd_" visible
  prefix    String   // First 8 chars for identification
  scopes    String[] // ["read:series", "read:summaries", "read:alerts"]
  lastUsed  DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([key])
  @@index([userId])
  @@map("api_keys")
}
```

### Response Format

```json
{
  "data": { ... },
  "meta": {
    "source": "U.S. Treasury FiscalData API",
    "lastUpdated": "2025-03-14T06:00:00Z",
    "freshness": "live",
    "requestId": "req_abc123"
  },
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 365,
    "hasMore": true
  }
}
```

### Implementation via Next.js API Routes

The public API runs as a separate route group in the Next.js app:

```
src/app/api/v1/
  series/
    route.ts                    # GET /v1/series
    [id]/
      route.ts                  # GET /v1/series/{id}
      observations/route.ts     # GET /v1/series/{id}/observations
  snapshots/route.ts            # GET /v1/snapshots
  debt/route.ts                 # GET /v1/debt
  liquidity/route.ts            # GET /v1/liquidity
  fiscal/route.ts               # GET /v1/fiscal
  auctions/route.ts             # GET /v1/auctions
  summaries/route.ts            # GET /v1/summaries
  health/route.ts               # GET /v1/health
```

### API Middleware Stack

```typescript
// Applied to all /api/v1/* routes
export async function apiMiddleware(req: NextRequest) {
  // 1. Extract API key from Authorization header
  const apiKey = extractApiKey(req);

  // 2. Validate key and get user/tier
  const keyData = await validateApiKey(apiKey);
  if (!keyData) return unauthorized();

  // 3. Check rate limit (Upstash sliding window)
  const { success } = await ratelimit.limit(keyData.userId);
  if (!success) return tooManyRequests();

  // 4. Check scope permissions
  if (!hasScope(keyData.scopes, req.pathname)) return forbidden();

  // 5. Log usage for billing
  await logApiUsage(keyData.userId, req.pathname);

  return NextResponse.next();
}
```

---

## 11. Auth & Billing Architecture

### Authentication Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│ NextAuth │───▶│  JWT     │───▶│  Session │
│  Login   │    │  (v5)    │    │  Token   │    │  Decoded │
│  (OAuth) │    │  Google/ │    │  (signed │    │  in API  │
│          │    │  GitHub) │    │  cookie) │    │  routes  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Auth Configuration (Current)

- **Strategy**: JWT (no session table lookups on every request)
- **Providers**: Google OAuth, GitHub OAuth
- **Role Assignment**: Admin emails from env → ADMIN role on first sign-in; all others → USER
- **Middleware**: Protects dashboard routes, redirects to login

### Billing Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│ Stripe   │───▶│ Webhook  │───▶│  Update  │
│  Clicks  │    │ Checkout │    │ Handler  │    │  DB Role │
│ Upgrade  │    │ Session  │    │ (verify  │    │ + Perms  │
│          │    │          │    │  sig)    │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Stripe Integration Points

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update Subscription, upgrade UserRole |
| `invoice.paid` | Extend `stripeCurrentPeriodEnd` |
| `invoice.payment_failed` | Set status to `past_due`, send dunning email |
| `customer.subscription.updated` | Sync plan changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Downgrade to USER, set status `canceled` |

### Pricing Tiers

| Tier | Price | Limits | Features |
|------|-------|--------|----------|
| **Free** | $0 | 3 alerts, 10 watchlist, 1 portfolio, 60s refresh | Basic dashboard, 30d history |
| **Pro** | $29/mo | 50 alerts, 200 watchlist, 10 portfolios, 15s refresh | Full macro, exports, 1Y history, AI briefings |
| **Enterprise** | $99/mo | 500 alerts, 2000 watchlist, 100 portfolios, 5s refresh | API access, webhooks, full history, priority support |

---

## 12. Admin Panel Architecture

### Admin Routes

```
/admin                          # Admin dashboard with system health
/admin/ingestion                # Ingestion job status, logs, manual triggers
/admin/users                    # User management, role changes
/admin/series                   # Data series management
/admin/alerts                   # System-wide alert monitoring
/admin/ai                       # AI generation logs, cost tracking
/admin/api                      # API key usage, rate limit stats
/admin/cache                    # Cache hit/miss rates, manual invalidation
```

### Admin Dashboard Metrics

```typescript
interface AdminDashboard {
  system: {
    activeUsers24h: number;
    apiRequests24h: number;
    errorRate: number;
    avgResponseTime: number;
  };
  ingestion: {
    lastRunStatus: Record<string, 'success' | 'failed' | 'running'>;
    failedJobs24h: number;
    staleSeries: string[];
  };
  ai: {
    dailyCost: number;
    monthlyBudget: number;
    generationsToday: number;
  };
  billing: {
    mrr: number;
    activeSubscriptions: number;
    churnRate30d: number;
  };
}
```

### Admin Access Control

```typescript
// Middleware for /admin/* routes
function requireAdmin(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  };
}
```

### Manual Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Force re-ingest | `POST /admin/ingestion/{worker}/run` | Trigger immediate ingestion |
| Invalidate cache | `POST /admin/cache/invalidate` | Clear specific cache keys |
| Toggle series | `PATCH /admin/series/{id}` | Enable/disable a data series |
| Generate briefing | `POST /admin/ai/generate` | Force AI summary regeneration |
| Impersonate user | `POST /admin/users/{id}/impersonate` | Debug user-specific issues |

---

## 13. Observability, Monitoring & Logging

### Three Pillars

#### A. Logging (Structured)

```typescript
// Use pino for structured JSON logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME,
    env: process.env.NODE_ENV,
  },
});

// Usage
logger.info({ seriesId: 'WALCL', records: 52 }, 'Ingestion completed');
logger.error({ err, jobId }, 'Ingestion failed');
```

**Log Destinations:**
- Development: stdout (pretty-printed)
- Production: stdout → collected by platform (Vercel/Railway logs)
- Retention: Aggregated in **Axiom** or **Betterstack** (90-day retention)

#### B. Metrics (Application)

```typescript
// Custom metrics tracked in Redis (lightweight, no external service needed)
interface AppMetrics {
  'api.requests': Counter;        // Total API requests
  'api.latency': Histogram;       // Response time distribution
  'api.errors': Counter;          // Error count by status code
  'ingestion.duration': Histogram; // ETL job duration
  'ingestion.records': Counter;    // Records ingested
  'cache.hits': Counter;          // Cache hit rate
  'cache.misses': Counter;        // Cache miss rate
  'alerts.evaluated': Counter;    // Alerts checked
  'alerts.triggered': Counter;    // Alerts fired
  'ai.tokens': Counter;           // AI API token usage
  'ai.cost': Counter;             // AI API cost ($)
}
```

**Metrics Destination:** Upstash Redis (increment counters) → Admin dashboard for visualization. Migrate to **Prometheus + Grafana** at scale.

#### C. Tracing (Distributed)

```typescript
// Sentry performance monitoring (already in deps)
import * as Sentry from '@sentry/nextjs';

// Trace ingestion jobs
const transaction = Sentry.startTransaction({
  name: 'ingestion:treasury-debt',
  op: 'job',
});

try {
  const span = transaction.startChild({ op: 'extract', description: 'Fetch from API' });
  const raw = await extract();
  span.finish();

  const loadSpan = transaction.startChild({ op: 'load', description: 'Upsert to DB' });
  await load(raw);
  loadSpan.finish();
} finally {
  transaction.finish();
}
```

### Health Check Endpoints

```typescript
// GET /api/health — public, for uptime monitors
{
  "status": "healthy",
  "version": "1.2.0",
  "checks": {
    "database": { "status": "up", "latencyMs": 12 },
    "redis": { "status": "up", "latencyMs": 3 },
    "fred_api": { "status": "up", "lastSuccess": "2025-03-14T06:10:00Z" },
    "treasury_api": { "status": "up", "lastSuccess": "2025-03-14T06:05:00Z" }
  }
}

// GET /api/health/deep — admin only, includes queue stats
{
  ...healthCheck,
  "queues": {
    "ingestion:treasury": { "waiting": 0, "active": 1, "failed": 0 },
    "ingestion:fred": { "waiting": 2, "active": 0, "failed": 0 },
    "alerts:evaluate": { "waiting": 0, "active": 0, "failed": 0 }
  },
  "staleSeries": [],
  "lastIngestion": "2025-03-14T06:10:00Z"
}
```

### Alerting (Ops Alerts, Not User Alerts)

| Alert | Condition | Channel |
|-------|----------|---------|
| API error rate >5% | 5-min rolling window | Slack + PagerDuty |
| Ingestion job failed 3x | After max retries exhausted | Slack |
| Data staleness | Any daily series >24h stale | Email |
| AI budget exceeded | Daily cost >$5 | Slack |
| Redis memory >80% | Upstash dashboard alert | Email |
| DB connection pool exhaustion | Active connections >80% of pool | PagerDuty |

### Uptime Monitoring

- **External**: Betterstack (status page at status.trackthedollar.com)
- **Synthetic checks**: Hit `/api/health` every 60s from 3 regions
- **Status page**: Auto-incident on 3 consecutive failures

---

## 14. Deployment Architecture

### TrackTheDollar.com (Frontend)

```
GitHub Push ──▶ Vercel CI/CD ──▶ Edge Network (global)
                    │
                    ├── Preview deployments (PRs)
                    ├── Production (main branch)
                    └── Staging (develop branch)
```

| Config | Value |
|--------|-------|
| Framework | Next.js 14 |
| Build | `next build` |
| Runtime | Node.js 20 (API routes) + Edge (middleware) |
| Regions | `iad1` (primary), auto-replication |
| Environment | Vercel env vars (encrypted) |

### TrackTheInternet.com (Backend Workers)

```
GitHub Push ──▶ Railway/Fly.io CI/CD ──▶ Always-on container
                    │
                    ├── Worker process (BullMQ consumers)
                    ├── Scheduler process (cron job producer)
                    └── Internal API (Fastify, port 3001)
```

| Config | Value |
|--------|-------|
| Runtime | Node.js 20 (Docker) |
| Memory | 512MB (workers), 256MB (scheduler) |
| CPU | 1 vCPU shared |
| Scaling | Vertical first; horizontal at >100 jobs/min |
| Health | HTTP health check on :3001/health |

### Database

| Service | Provider | Config |
|---------|----------|--------|
| PostgreSQL | Neon (serverless) | `us-east-1`, autoscaling 0.25-4 CU |
| Redis | Upstash | `us-east-1`, REST API, 256MB |

### Deployment Checklist

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy-frontend:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    # Vercel auto-deploys from GitHub integration

  deploy-backend:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: trackthedollar-workers

  migrate-db:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 15. Security Best Practices

### Authentication & Authorization

| Practice | Implementation |
|----------|---------------|
| OAuth only (no passwords) | NextAuth with Google/GitHub providers |
| JWT with short expiry | 24h access token, 30d refresh |
| RBAC enforcement | Server-side `hasMinimumTier()` on every API route |
| API key hashing | Store `sha256(key)`, only show prefix `ttd_abc...` |
| Session invalidation | `redisDel(sessionKey)` on logout/role change |

### Data Protection

| Practice | Implementation |
|----------|---------------|
| HTTPS everywhere | Vercel enforces; HSTS header |
| CORS | Allow only `trackthedollar.com` origins |
| CSP headers | `default-src 'self'; script-src 'self' 'unsafe-eval'` (Next.js requirement) |
| SQL injection | Prisma parameterized queries (no raw SQL in app code) |
| XSS prevention | React auto-escaping; no `dangerouslySetInnerHTML` |
| Rate limiting | Upstash sliding window per user/IP |

### Infrastructure Security

| Practice | Implementation |
|----------|---------------|
| Secrets management | Vercel encrypted env vars; never in code/git |
| Dependency scanning | `npm audit` in CI; Dependabot alerts |
| Environment isolation | Separate DB/Redis for dev/staging/prod |
| Webhook verification | Stripe signature verification on all webhook handlers |
| API key rotation | Support multiple active keys; deprecation period |
| Access logging | Log all admin actions with IP and timestamp |

### OWASP Top 10 Mitigations

| Risk | Mitigation |
|------|-----------|
| **A01 Broken Access Control** | RBAC checks on every route; middleware enforcement |
| **A02 Cryptographic Failures** | No PII beyond email; no payment data (Stripe handles) |
| **A03 Injection** | Prisma ORM; Zod validation on all inputs |
| **A04 Insecure Design** | Tier-based rate limiting; budget caps on AI |
| **A05 Security Misconfiguration** | Strict CSP; no default credentials; env validation at startup |
| **A06 Vulnerable Components** | Dependabot; `npm audit` in CI |
| **A07 Auth Failures** | OAuth only; no custom password logic |
| **A08 Data Integrity** | Webhook signature verification; API response validation |
| **A09 Logging Failures** | Structured logging; admin action audit trail |
| **A10 SSRF** | No user-supplied URLs fetched server-side |

### Environment Variable Validation

```typescript
// src/lib/env.ts — validated at startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  FRED_API_KEY: z.string().min(1),
  PERPLEXITY_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## 16. TrackTheInternet as Backend Intelligence Layer

### Concept

**TrackTheInternet.com** is NOT a user-facing website. It is the **backend intelligence engine** that powers TrackTheDollar.com and potentially other future data products.

```
┌─────────────────────────────────────────────────────────┐
│                 TrackTheInternet.com                      │
│           "The Intelligence Engine"                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Data     │  │ AI       │  │ Alert    │              │
│  │ Ingestor │  │ Pipeline │  │ Engine   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│       ▼              ▼              ▼                    │
│  ┌─────────────────────────────────────────┐            │
│  │          Shared PostgreSQL               │            │
│  │          Shared Redis                    │            │
│  └─────────────────────────────────────────┘            │
│       │              │              │                    │
│       ▼              ▼              ▼                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Internal │  │ Webhook  │  │ Health   │              │
│  │ API      │  │ Receiver │  │ Monitor  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │ Internal API (authenticated)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 TrackTheDollar.com                        │
│           "The Premium Frontend"                         │
│                                                          │
│  Dashboard → Debt → Liquidity → Fiscal → Markets        │
└─────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Responsibility | TrackTheInternet | TrackTheDollar |
|---------------|-----------------|----------------|
| Data ingestion (ETL) | ✅ Owns all workers | ❌ |
| Job scheduling | ✅ BullMQ scheduler | ❌ |
| AI content generation | ✅ Generates all AI content | ❌ Reads from DB/cache |
| Alert evaluation | ✅ Runs evaluator | ❌ |
| Notification dispatch | ✅ Sends emails/push | ❌ |
| Data storage | ✅ Writes to DB | ✅ Reads from DB |
| Caching | ✅ Warms cache after ingestion | ✅ Reads from cache |
| User-facing API | ❌ | ✅ Serves /api/* routes |
| Authentication | ❌ | ✅ NextAuth handles auth |
| Billing | ❌ | ✅ Stripe integration |
| Admin panel | ❌ (exposes admin API) | ✅ Renders admin UI |

### Internal API Contract

TrackTheDollar can call TrackTheInternet's internal API for operations that require the worker process:

```
POST /internal/ingestion/trigger    # Force re-ingest a series
POST /internal/ai/generate          # Generate AI content on demand
POST /internal/cache/warm           # Pre-warm cache keys
GET  /internal/status               # Worker health and queue stats
```

**Authentication**: Shared secret in `INTERNAL_API_KEY` env var, validated via `Authorization: Bearer` header.

### Future Expansion

TrackTheInternet is designed to power multiple frontend products:

```
TrackTheInternet.com (Engine)
  ├── TrackTheDollar.com    (Macro intelligence — current)
  ├── TrackTheSpending.com  (Federal spending deep-dive — future)
  ├── TrackTheDebt.com      (National debt focus — future)
  └── API Customers         (Paid data access — Enterprise tier)
```

Each frontend is a thin Next.js app that reads from the shared database and cache. The intelligence engine handles all data acquisition, processing, and AI generation centrally.

### Deployment Independence

The two services deploy independently:
- **TrackTheDollar** deploys on every frontend change (Vercel)
- **TrackTheInternet** deploys on every backend/worker change (Railway)
- **Shared DB migrations** run as a separate CI step, coordinated between both services
- **Zero-downtime**: Workers use BullMQ's graceful shutdown; API routes are stateless

---

## Summary: Decision Matrix

| Decision | Choice | Alternative Considered | Rationale |
|----------|--------|----------------------|-----------|
| Frontend hosting | Vercel | Cloudflare Pages | Native Next.js support, preview deploys |
| Backend hosting | Railway | Fly.io, AWS ECS | Simple Docker deploy, built-in Redis |
| Database | Neon PostgreSQL | Supabase, PlanetScale | Serverless scaling, branching, Prisma-native |
| Cache | Upstash Redis | Vercel KV, Momento | REST API works in Edge, existing integration |
| Job queue | BullMQ | Inngest, Quirrel | Battle-tested, Redis-backed, great DX |
| AI provider | Claude + Perplexity | OpenAI, Gemini | Claude for structured analysis, Perplexity for web research |
| Search | PostgreSQL FTS → Typesense | Elasticsearch, Algolia | Start simple, scale when needed |
| Monitoring | Sentry + Axiom | Datadog, New Relic | Cost-effective for startup scale |
| Email | Resend | SendGrid, AWS SES | Developer-friendly, React Email templates |
| CDN | Vercel Edge | Cloudflare, Fastly | Automatic with Vercel deployment |
