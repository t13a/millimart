import * as z from "zod";
import { MoneySchema } from "../../currency";
import { ItemRefSchema } from "./ItemRefSchema";
import { UserSchema } from "./UserSchema";

export type OrderItem = z.infer<typeof OrderItemSchema>;
export const OrderItemSchema = ItemRefSchema.extend({
  quantity: z.number().positive(),
});

export type Order = z.infer<typeof OrderSchema>;
export const OrderSchema = z.object({
  id: z.number().positive(),
  sellerId: UserSchema.shape.id,
  buyerId: UserSchema.shape.id,
  items: OrderItemSchema.array(),
  amount: MoneySchema,
});
