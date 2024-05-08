import { z } from "zod";
import { ItemSchema, UserSchema } from "./values";

export const MarketCommandTypePrefix = "internal.millimart.market.v1.";

const createMarketCommand = <
  Typename extends string,
  DataSchema extends z.ZodType,
>(
  typeName: Typename,
  dataSchema: DataSchema,
) =>
  z.object({
    type: z.literal(`${MarketCommandTypePrefix}${typeName}`),
    data: dataSchema,
  });

export type RegisterUserCommand = z.infer<typeof RegisterUserCommandSchema>;
export const RegisterUserCommandSchema = createMarketCommand(
  "RegisterUser",
  UserSchema,
);

export type RegisterItemCommand = z.infer<typeof RegisterItemCommandSchema>;
export const RegisterItemCommandSchema = createMarketCommand(
  "RegisterItem",
  ItemSchema,
);

export type MarketCommand = z.infer<typeof MarketCommandSchema>;
export const MarketCommandSchema = z.union([
  RegisterUserCommandSchema,
  RegisterItemCommandSchema,
]);
