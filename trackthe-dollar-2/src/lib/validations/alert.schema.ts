// src/lib/validations/alert.schema.ts
import { z } from "zod";
import { symbolSchema } from "./market.schema";

export const createAlertSchema = z.object({
  symbol: symbolSchema,
  condition: z.enum(
    ["above", "below", "percent_change_up", "percent_change_down"],
    { errorMap: () => ({ message: "Invalid alert condition" }) }
  ),
  targetValue: z
    .number({ invalid_type_error: "Target value must be a number" })
    .positive("Target value must be positive")
    .max(10_000_000, "Target value too large"),
  notifyVia: z
    .array(z.enum(["email", "push", "sms"]))
    .min(1, "At least one notification channel required")
    .max(3)
    .default(["email"]),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be a valid ISO 8601 datetime" })
    .optional()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      "Expiry must be in the future"
    ),
});

export const updateAlertSchema = z
  .object({
    condition: z
      .enum(["above", "below", "percent_change_up", "percent_change_down"])
      .optional(),
    targetValue: z.number().positive().max(10_000_000).optional(),
    notifyVia: z.array(z.enum(["email", "push", "sms"])).min(1).max(3).optional(),
    status: z.enum(["active", "paused"]).optional(),
    expiresAt: z
      .string()
      .datetime()
      .optional()
      .refine(
        (val) => !val || new Date(val) > new Date(),
        "Expiry must be in the future"
      ),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const alertIdSchema = z.object({
  id: z.string().cuid("Invalid alert ID"),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
