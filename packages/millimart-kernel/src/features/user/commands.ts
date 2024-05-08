import { z } from "zod";
import { MoneySchema } from "../currency";
import { StockSchema } from "./values";

export const UserCommandTypePrefix = "internal.millimart.user.v1.";

const createUserCommand = <T extends string, D extends z.ZodType>(
  type: T,
  dataSchema: D,
) =>
  z.object({
    type: z.literal(`${UserCommandTypePrefix}${type}`),
    data: dataSchema,
  });

export type AddStockCommand = z.infer<typeof AddStockCommandSchema>;
export const AddStockCommandSchema = createUserCommand("AddStock", StockSchema);

export type RemoveStockCommand = z.infer<typeof RemoveStockCommandSchema>;
export const RemoveStockCommandSchema = createUserCommand(
  "RemoveStock",
  z.object({
    stockId: StockSchema.shape.id,
  }),
);

export type ChangeStockCommand = z.infer<typeof ChangeStockCommandSchema>;
export const ChangeStockCommandSchema = createUserCommand(
  "ChangeStock",
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

export type UserCommand = z.infer<typeof UserCommandSchema>;
export const UserCommandSchema = z.union([
  AddStockCommandSchema,
  RemoveStockCommandSchema,
  ChangeStockCommandSchema,
]);
