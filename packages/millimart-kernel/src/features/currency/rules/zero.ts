import { Currency, Money } from "../values";

export const zero = (currency: Currency): Money => {
  return { currency, value: 0 };
};
