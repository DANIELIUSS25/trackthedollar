"use client";
// src/hooks/usePortfolio.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Portfolio } from "@/types/portfolio";
import type { ApiSuccess } from "@/lib/utils/api-response";

async function fetchPortfolios(): Promise<Portfolio[]> {
  const res = await fetch("/api/portfolio");
  if (!res.ok) throw new Error("Failed to fetch portfolios");
  const json: ApiSuccess<Portfolio[]> = await res.json();
  return json.data;
}

export function usePortfolio() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolios,
    staleTime: 30_000,
  });

  const addHolding = useMutation({
    mutationFn: async (data: { symbol: string; quantity: number; avgCostBasis: number; notes?: string }) => {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Failed to add holding");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolio"] }),
  });

  const removeHolding = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete holding");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolio"] }),
  });

  return { ...query, addHolding, removeHolding };
}
