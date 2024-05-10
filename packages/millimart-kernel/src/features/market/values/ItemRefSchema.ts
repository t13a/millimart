import { z } from "zod";
import { ItemSchema } from "./ItemSchema";

export type ItemRef = z.infer<typeof ItemRefSchema>;
export const ItemRefSchema = z.object({
  itemId: ItemSchema.shape.id,
});
