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

export type CurrencyErrorName = keyof CurrencyErrorDataMap;

export interface CurrencyErrorInterface<T extends CurrencyErrorName> {
  readonly name: T;
  readonly data: CurrencyErrorDataMap[T];
}

export class CurrencyError<T extends CurrencyErrorName>
  extends Error
  implements CurrencyErrorInterface<T>
{
  constructor(
    readonly name: T,
    readonly data: CurrencyErrorDataMap[T],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
