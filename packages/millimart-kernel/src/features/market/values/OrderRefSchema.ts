import { z } from "zod";
import { OrderSchema } from "./OrderSchema";

export type OrderRef = z.infer<typeof OrderRefSchema>;
export const OrderRefSchema = z.object({
  orderId: OrderSchema.shape.id,
});
