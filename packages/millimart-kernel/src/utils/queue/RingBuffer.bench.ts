import { bench, describe } from "vitest";
import { range } from "../misc";
import { RingBuffer } from "./RingBuffer";

describe("RingBuffer#push", () => {
  const array = new Array<number>();
  const buffer = new RingBuffer<number>(10000);

  bench("Array#push", () => {
    array.push(1);
  });
  bench("RingBuffer#push", () => {
    buffer.push(1);
  });
});

describe("RingBuffer#shift (10000)", () => {
  const array = new Array<number>();
  const buffer = new RingBuffer<number>(10000);
  Array.from(range(1, 10000)).forEach((n) => {
    array.push(n);
    buffer.push(n);
  });

  bench("Array#shift", () => {
    array.shift();
  });
  bench("RingBuffer#push", () => {
    buffer.shift();
  });
});
