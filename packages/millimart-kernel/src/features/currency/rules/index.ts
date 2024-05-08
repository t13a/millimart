import { CurrencyError } from "../CurrencyError";
import { Currency, ExchangeRate, Money } from "../values";

export const zero = (currency: Currency): Money => {
  return { currency, value: 0 };
};

export const convert =
  (exchangeRate: ExchangeRate) =>
  (targetCurrency: Currency) =>
  ({ currency: sourceCurrency, value }: Money): Money => {
    const rate = exchangeRate[sourceCurrency]?.[targetCurrency];

    if (rate === undefined) {
      throw new CurrencyError("NoExchangeRateError", {
        targetCurrency,
        sourceCurrency,
      });
    }

    return {
      currency: targetCurrency,
      value: value * rate,
    };
  };

export const isDifferentCurrency = (a: Money, b: Money): boolean => {
  return !!a && !!b && a.currency !== b.currency;
};

export const add = (a: Money, b: Money): Money => {
  if (isDifferentCurrency(a, b)) {
    throw new CurrencyError("DifferentCurrencyError", { a, b });
  }

  return {
    currency: a.currency,
    value: a.value + b.value,
  };
};

export const sub = (a: Money, b: Money): Money => {
  if (isDifferentCurrency(a, b)) {
    throw new CurrencyError("DifferentCurrencyError", { a, b });
  }

  return {
    currency: a.currency,
    value: a.value - b.value,
  };
};

export const mul =
  (n: number) =>
  (a: Money): Money => {
    return {
      currency: a.currency,
      value: a.value * n,
    };
  };
