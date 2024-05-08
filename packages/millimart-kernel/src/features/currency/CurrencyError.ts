import { Currency, Money } from "./values";

export type CurrencyErrorDataMap = {
  DifferentCurrencyError: {
    a: Money;
    b: Money;
  };
  NoExchangeRateError: {
    sourceCurrency: Currency;
    targetCurrency: Currency;
  };
};

export class CurrencyError<
  Type extends keyof CurrencyErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: CurrencyErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
