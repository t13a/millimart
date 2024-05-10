import { Money } from "../values";

export const mul =
  (n: number) =>
  (a: Money): Money => {
    return {
      currency: a.currency,
      value: a.value * n,
    };
  };
