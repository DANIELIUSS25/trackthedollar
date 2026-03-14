// src/lib/ai/index.ts
// Public API for the AI intelligence layer.

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  AIFeature,
  AIGenerationResult,
  ConfidenceLevel,
  DataContext,
  EvalResult,
  ParsedCitation,
  CostSummary,
} from "./types";

// ─── Feature Functions (high-level) ──────────────────────────────────────────
export {
  generateDailyNarrative,
  generateWhatChangedWhy,
  generateResearchNote,
  generateEventExplainer,
  generateWidgetSummary,
  answerUserQuestion,
  generateBatchResearchNotes,
  CURATED_RESEARCH_TOPICS,
} from "./features";

// ─── Orchestrator ────────────────────────────────────────────────────────────
export { generateAIContent, NEVER_AI_FEATURES } from "./orchestrator";

// ─── Evaluation ──────────────────────────────────────────────────────────────
export {
  evaluateContent,
  getPublicationAction,
  scoreToConfidence,
} from "./evaluation";

// ─── Perplexity Client ──────────────────────────────────────────────────────
export {
  getPerplexityClient,
  PerplexityError,
  TRUSTED_DOMAINS,
} from "./perplexity-client";
export type {
  PerplexityModel,
  PerplexityResponse,
  PerplexityRequestOptions,
} from "./perplexity-client";

// ─── Claude-based generators (existing) ──────────────────────────────────────
export {
  generateDailyBriefing,
  generateMetricExplainer,
  generateAlertContext,
  generateResearchNote as generateResearchNoteLegacy,
} from "./generate";
