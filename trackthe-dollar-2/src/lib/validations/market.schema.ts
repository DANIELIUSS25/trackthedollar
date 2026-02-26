// src/lib/validations/market.schema.ts
import { z } from "zod";

const SYMBOL_REGEX = /^[A-Z0-9.\-]{1,12}$/;

/**
 * Sanitize and validate a ticker symbol.
 * Allows: A-Z, 0-9, dot, hyphen. Max 12 chars.
 * Rejects everything else — prevents injection into third-party API URLs.
 */
export const symbolSchema = z
  .string()
  .min(1, "Symbol is required")
  .max(12, "Symbol must be 12 characters or fewer")
  .transform((s) => s.toUpperCase().trim())
  .refine((s) => SYMBOL_REGEX.test(s), {
    message: "Invalid symbol format",
  });

export const quoteQuerySchema = z.object({
  symbol: symbolSchema,
});

export const historyQuerySchema = z.object({
  symbol: symbolSchema,
  range: z.enum(["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"], {
    errorMap: () => ({ message: "Invalid range. Must be one of: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y" }),
  }),
});

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(50, "Query too long")
    .transform((s) => s.trim()),
});

export type QuoteQuery = z.infer<typeof quoteQuerySchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
