// src/lib/validations/stripe.schema.ts
import { z } from "zod";

export const createCheckoutSchema = z.object({
  priceId: z
    .string()
    .min(1, "Price ID is required")
    .startsWith("price_", "Invalid Price ID format"),
  successUrl: z
    .string()
    .url("successUrl must be a valid URL")
    .optional(),
  cancelUrl: z
    .string()
    .url("cancelUrl must be a valid URL")
    .optional(),
});

export const createPortalSchema = z.object({
  returnUrl: z
    .string()
    .url("returnUrl must be a valid URL")
    .optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type CreatePortalInput = z.infer<typeof createPortalSchema>;
