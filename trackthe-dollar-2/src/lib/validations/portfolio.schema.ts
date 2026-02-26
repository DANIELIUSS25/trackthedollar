// src/lib/validations/portfolio.schema.ts
import { z } from "zod";
import { symbolSchema } from "./market.schema";

export const addHoldingSchema = z.object({
  symbol: symbolSchema,
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Quantity must be positive")
    .max(1_000_000_000, "Quantity too large")
    .multipleOf(0.00000001, "Max 8 decimal places"),
  avgCostBasis: z
    .number({ invalid_type_error: "Cost basis must be a number" })
    .nonnegative("Cost basis cannot be negative")
    .max(10_000_000, "Cost basis too large")
    .multipleOf(0.00000001, "Max 8 decimal places"),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

export const updateHoldingSchema = z
  .object({
    quantity: z
      .number()
      .positive("Quantity must be positive")
      .max(1_000_000_000)
      .multipleOf(0.00000001)
      .optional(),
    avgCostBasis: z
      .number()
      .nonnegative()
      .max(10_000_000)
      .multipleOf(0.00000001)
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      data.quantity !== undefined ||
      data.avgCostBasis !== undefined ||
      data.notes !== undefined,
    { message: "At least one field must be provided" }
  );

export const holdingIdSchema = z.object({
  id: z.string().cuid("Invalid holding ID"),
});

export type AddHoldingInput = z.infer<typeof addHoldingSchema>;
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
