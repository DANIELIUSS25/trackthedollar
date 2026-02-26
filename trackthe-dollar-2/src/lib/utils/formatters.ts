// src/lib/utils/formatters.ts

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const PERCENT = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const NUMBER_COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

/**
 * Format a dollar amount. Automatically switches to compact
 * notation for values ≥ 1 000 000 (e.g. $1.23M, $4.56B).
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1_000_000) return USD_COMPACT.format(value);
  return USD.format(value);
}

/**
 * Format a plain dollar amount always in full notation.
 */
export function formatUSD(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return USD.format(value);
}

/**
 * Format a percentage change. Prepends + for positives.
 * Input: decimal fraction (0.05 = 5%) OR raw percent (5 = 5%).
 * Pass `isDecimal: false` when the input is already a percent value.
 */
export function formatPercent(
  value: number | null | undefined,
  isDecimal = true
): string {
  if (value === null || value === undefined) return "—";
  const decimal = isDecimal ? value : value / 100;
  return PERCENT.format(decimal);
}

/**
 * Format large numbers compactly: 1 234 567 → 1.23M
 */
export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return NUMBER_COMPACT.format(value);
}

/**
 * Format volume with suffix: 83 456 789 → 83.46M
 */
export function formatVolume(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return NUMBER_COMPACT.format(value);
}

/**
 * Format a market cap value with B/T suffix.
 */
export function formatMarketCap(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return USD_COMPACT.format(value);
}

/**
 * Format a price change with explicit sign: +1.23 / -0.45
 */
export function formatChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${USD.format(value)}`;
}

/**
 * Format a date to a readable string.
 */
export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a datetime with time component.
 */
export function formatDateTime(
  value: string | Date | null | undefined
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns "positive" | "negative" | "neutral" for styling.
 */
export function getChangeDirection(
  value: number | null | undefined
): "positive" | "negative" | "neutral" {
  if (value === null || value === undefined || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
