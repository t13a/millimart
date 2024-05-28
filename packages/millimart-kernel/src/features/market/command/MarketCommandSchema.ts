import { z } from "zod";
import { ItemSchema, OrderSchema, UserSchema } from "../values";

export const MarketCommandTypePrefix = "internal.millimart.market.v1.";

const createMarketCommand = <
  TypeName extends string,
  DataSchema extends z.ZodType,
>(
  typeName: TypeName,
  dataSchema: DataSchema,
) =>
  z.object({
    type: z.literal(`${MarketCommandTypePrefix}${typeName}`),
    data: dataSchema,
  });

export type RegisterUserCommand = z.infer<typeof RegisterUserCommandSchema>;
export const RegisterUserCommandSchema = createMarketCommand(
  "RegisterUser",
  z.object({ user: UserSchema }),
);

export type RegisterItemCommand = z.infer<typeof RegisterItemCommandSchema>;
export const RegisterItemCommandSchema = createMarketCommand(
  "RegisterItem",
  z.object({ item: ItemSchema }),
);

export type ConfirmOrderCommand = z.infer<typeof ConfirmOrderCommandSchema>;
export const ConfirmOrderCommandSchema = createMarketCommand(
  "ConfirmOrder",
  z.object({ order: OrderSchema }),
);

export type MarketCommand = z.infer<typeof MarketCommandSchema>;
export const MarketCommandSchema = z.union([
  RegisterUserCommandSchema,
  RegisterItemCommandSchema,
  ConfirmOrderCommandSchema,
]);

export type MarketCommandTypeName =
  MarketCommand["type"] extends `${typeof MarketCommandTypePrefix}${infer TypeName}`
    ? TypeName
    : never;

export type MarketCommandMap = {
  [TypeName in MarketCommandTypeName]: Extract<
    MarketCommand,
    { type: `${typeof MarketCommandTypePrefix}${TypeName}` }
  >;
};
