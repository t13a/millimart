import { z } from "zod";

export type Currency = z.infer<typeof CurrencySchema>;
export const CurrencySchema = z.union([
  z.literal("EUR"),
  z.literal("GBP"),
  z.literal("JPY"),
  z.literal("TMP"),
  z.literal("USD"),
]);
