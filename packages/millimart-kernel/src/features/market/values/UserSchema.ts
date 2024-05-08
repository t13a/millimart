import { z } from "zod";
import { MoneySchema } from "../../currency";

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/),
  balance: MoneySchema,
  emoji: z.string().emoji().optional(),
});
