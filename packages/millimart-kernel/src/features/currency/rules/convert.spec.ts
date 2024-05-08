import { describe, expect, it } from "vitest";
import { convert } from ".";
import { CurrencyError } from "../CurrencyError";

describe("convert", () => {
  const exchangeRate = {
    JPY: {
      JPY: 1,
      USD: 0.0066,
    },
    USD: {
      JPY: 150,
      USD: 1,
    },
  };

  it("converts money into different currency", () => {
    expect(
      convert(exchangeRate)("JPY")({
        currency: "USD",
        value: 100,
      }),
    ).toStrictEqual({
      currency: "JPY",
      value: 15000,
    });

    expect(
      convert(exchangeRate)("USD")({
        currency: "JPY",
        value: 100,
      }),
    ).toStrictEqual({
      currency: "USD",
      value: 0.66,
    });
  });

  it("converts money into same currency", () => {
    expect(
      convert(exchangeRate)("USD")({
        currency: "USD",
        value: 100,
      }),
    ).toStrictEqual({
      currency: "USD",
      value: 100,
    });

    expect(
      convert(exchangeRate)("JPY")({
        currency: "JPY",
        value: 100,
      }),
    ).toStrictEqual({
      currency: "JPY",
      value: 100,
    });
  });

  it("throws an error if exchange rate not found", () => {
    expect(() =>
      convert(exchangeRate)("EUR")({
        currency: "USD",
        value: 100,
      }),
    ).toThrowError(CurrencyError);
  });
});
