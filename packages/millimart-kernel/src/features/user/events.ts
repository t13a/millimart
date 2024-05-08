import { z } from "zod";
import { CloudEventSchema } from "../cloudevents";
import { MoneySchema } from "../currency";
import { StockSchema } from "./values";

export const UserEventTypePrefix = "internal.millimart.user.v1.";

const createUserEventSchema = <
  TypeName extends string,
  DataSchema extends z.ZodType,
>(
  typeName: TypeName,
  dataSchema: DataSchema,
) =>
  CloudEventSchema.extend({
    specversion: z.literal("1.0"),
    type: z.literal(`${UserEventTypePrefix}${typeName}`),
    data: dataSchema,
  });

export type StockAvailable = z.infer<typeof StockAvailableSchema>;
export const StockAvailableSchema = createUserEventSchema(
  "StockAvailable",
  StockSchema,
);

export type StockUnavailable = z.infer<typeof StockUnavailableSchema>;
export const StockUnavailableSchema = createUserEventSchema(
  "StockUnavailable",
  z.object({
    stockId: StockSchema.shape.id,
  }),
);

export type StockChanged = z.infer<typeof StockChangedSchema>;
export const StockChangedSchema = createUserEventSchema(
  "StockChanged",
  z.union([
    z.object({
      stockId: StockSchema.shape.id,
      delta: z.literal(true),
      deltaQuantity: z.number().optional(),
      deltaPrice: MoneySchema.optional(),
    }),
    z.object({
      stockId: StockSchema.shape.id,
      delta: z.literal(false),
      quantity: StockSchema.shape.quantity.optional(),
      price: StockSchema.shape.price.optional(),
    }),
  ]),
);

export type UserEvent = z.infer<typeof UserEventSchema>;
export const UserEventSchema = z.union([
  StockAvailableSchema,
  StockUnavailableSchema,
  StockChangedSchema,
]);
