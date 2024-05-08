import z from "zod";
import { CurrencySchema } from "./CurrencySchema";

export type Money = z.infer<typeof MoneySchema>;
export const MoneySchema = z.object({
  currency: CurrencySchema,
  value: z.number(),
});
