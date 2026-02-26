"use client";
// src/hooks/useAlerts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PriceAlert, CreateAlertInput } from "@/types/alert";
import type { ApiSuccess } from "@/lib/utils/api-response";

async function fetchAlerts(): Promise<PriceAlert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  const json: ApiSuccess<PriceAlert[]> = await res.json();
  return json.data;
}

export function useAlerts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 30_000,
  });

  const createAlert = useMutation({
    mutationFn: async (data: CreateAlertInput) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Failed to create alert");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alert");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return { ...query, createAlert, deleteAlert };
}
