import z from "zod";
import { CurrencySchema } from "./CurrencySchema";

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
export const ExchangeRateSchema = z.record(
  CurrencySchema,
  z.record(CurrencySchema, z.number().positive()),
);
