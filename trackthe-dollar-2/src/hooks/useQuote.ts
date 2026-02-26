// src/hooks/useQuote.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@/types/market";
import type { ApiSuccess } from "@/lib/utils/api-response";

async function fetchQuote(symbol: string): Promise<Quote> {
  const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Failed to fetch quote");
  }
  const json: ApiSuccess<Quote> = await res.json();
  return json.data;
}

export function useQuote(symbol: string | null, refetchIntervalMs = 30_000) {
  return useQuery({
    queryKey: ["quote", symbol?.toUpperCase()],
    queryFn: () => fetchQuote(symbol!),
    enabled: !!symbol,
    refetchInterval: refetchIntervalMs,
    staleTime: 10_000,
  });
}
