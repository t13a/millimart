import { Money } from "../values";

export const isDifferentCurrency = (a: Money, b: Money): boolean => {
  return !!a && !!b && a.currency !== b.currency;
};
