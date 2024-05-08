import { z } from "zod";

export type Item = z.infer<typeof ItemSchema>;
export const ItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string().emoji().optional(),
});
