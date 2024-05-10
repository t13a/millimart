import { CurrencyError } from "../CurrencyError";
import { Currency, ExchangeRate, Money } from "../values";

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
