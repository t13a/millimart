import { describe, expect, it } from "vitest";
import { range } from "./range";

describe("range", () => {
  it("generates sequential numbers", () => {
    expect(Array.from(range(1, 3))).toStrictEqual([1, 2, 3]);
  });

  it("generates sequential numbers (reverse order)", () => {
    expect(Array.from(range(3, 1))).toStrictEqual([3, 2, 1]);
  });

  it("generates a number", () => {
    expect(Array.from(range(1, 1))).toStrictEqual([1]);
  });
});
