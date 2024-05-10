import { z } from "zod";
import { StockSchema } from "./StockSchema";

export type StockRef = z.infer<typeof StockRefSchema>;
export const StockRefSchema = z.object({
  stockId: StockSchema.shape.id,
});
