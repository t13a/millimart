import { z } from "zod";

export type SubscriptionConfig = z.infer<typeof SubscriptionConfigSchema>;
export const SubscriptionConfigSchema = z.record(z.string(), z.unknown());

export type SubscriptionResend = z.infer<typeof SubscriptionResendSchema>;
export const SubscriptionResendSchema = z.union([
  z.object({
    from: z.literal("First"),
  }),
  z.object({
    from: z.literal("Next"),
    eventId: z.string().min(1),
  }),
  z.object({
    from: z.literal("Last"),
  }),
]);

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export const SubscriptionStatusSchema = z.object({
  lastEventId: z.string().min(1).optional(),
});

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>;
export const SubscriptionRequestSchema = z.object({
  sink: z.string().min(1),
  config: SubscriptionConfigSchema.optional(),
  resend: SubscriptionResendSchema.optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
export const SubscriptionSchema = z.object({
  id: z.string().min(1),
  sink: z.string().min(1),
  config: SubscriptionConfigSchema.optional(),
  status: SubscriptionStatusSchema,
});
