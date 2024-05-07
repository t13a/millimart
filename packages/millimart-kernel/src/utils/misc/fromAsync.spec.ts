import { describe, expect, it } from "vitest";
import { fromAsync } from "./fromAsync";

describe("fromAsync", () => {
  it("converts an AsyncIterable to an array", async () => {
    const iterable: AsyncIterable<number> = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    expect(await fromAsync(iterable)).toStrictEqual([1, 2, 3]);
  });
});
