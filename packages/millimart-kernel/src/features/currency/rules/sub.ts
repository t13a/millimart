import { CurrencyError } from "../CurrencyError";
import { Money } from "../values";
import { isDifferentCurrency } from "./isDifferentCurrency";

export const sub = (a: Money, b: Money): Money => {
  if (isDifferentCurrency(a, b)) {
    throw new CurrencyError("DifferentCurrencyError", { a, b });
  }

  return {
    currency: a.currency,
    value: a.value - b.value,
  };
};
