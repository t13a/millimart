import { z } from "zod";
import { CloudEventSchema } from "../../utils";
import { ItemSchema, OrderSchema, UserRefSchema, UserSchema } from "./values";

export const MarketEventTypePrefix = "internal.millimart.market.v1.";

const createMarketEventSchema = <T extends string, D extends z.ZodType>(
  type: T,
  dataSchema: D,
) =>
  CloudEventSchema.extend({
    specversion: z.literal("1.0"),
    type: z.literal(`${MarketEventTypePrefix}${type}`),
    data: dataSchema,
  });

export type UserEnteredEvent = z.infer<typeof UserEnteredEventSchema>;
export const UserEnteredEventSchema = createMarketEventSchema(
  "UserEntered",
  z.object({ user: UserSchema }),
);

export type UserLeftEvent = z.infer<typeof UserLeftEventSchema>;
export const UserLeftEventSchema = createMarketEventSchema(
  "UserLeft",
  UserRefSchema,
);

export type ItemRegisteredEvent = z.infer<typeof ItemRegisteredEventSchema>;
export const ItemRegisteredEventSchema = createMarketEventSchema(
  "ItemRegistered",
  z.object({ item: ItemSchema }),
);

export type OrderConfirmedEvent = z.infer<typeof OrderConfirmedEventSchema>;
export const OrderConfirmedEventSchema = createMarketEventSchema(
  "OrderConfirmed",
  z.object({ order: OrderSchema }),
);

export type MarketEvent = z.infer<typeof MarketEventSchema>;
export const MarketEventSchema = z.union([
  UserEnteredEventSchema,
  UserLeftEventSchema,
  ItemRegisteredEventSchema,
  OrderConfirmedEventSchema,
]);
