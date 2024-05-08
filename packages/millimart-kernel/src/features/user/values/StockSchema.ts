import { z } from "zod";
import { MoneySchema } from "../../currency";
import { ItemSchema } from "../../market";

export type Stock = z.infer<typeof StockSchema>;
export const StockSchema = z.object({
  id: z.number().min(1),
  itemId: ItemSchema.shape.id,
  quantity: z.number().nonnegative(),
  price: MoneySchema,
});
