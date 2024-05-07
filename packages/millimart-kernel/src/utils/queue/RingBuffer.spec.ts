import { describe, expect, it } from "vitest";
import { RingBuffer } from "./RingBuffer";

describe("RingBuffer", () => {
  describe("constructor", () => {
    it("throws an error if no capacity (capacity=0)", () => {
      expect(() => new RingBuffer<number>(0)).toThrow();
    });

    it("creates a new instance if capacity is available (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      expect(buffer.length).toBe(0);
      expect(Array.from(buffer)).toStrictEqual([]);
    });
  });

  describe("push", () => {
    it("appends new item to capacity (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);

      expect(buffer.push(0)).toBe(1);
      expect(Array.from(buffer)).toStrictEqual([0]);
    });

    it("appends new item to capacity (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);

      expect(buffer.push(0)).toBe(1);
      expect(Array.from(buffer)).toStrictEqual([0]);

      expect(buffer.push(1)).toBe(2);
      expect(Array.from(buffer)).toStrictEqual([0, 1]);
    });

    it("appends new item to capacity (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);

      expect(buffer.push(0)).toBe(1);
      expect(Array.from(buffer)).toStrictEqual([0]);

      expect(buffer.push(1)).toBe(2);
      expect(Array.from(buffer)).toStrictEqual([0, 1]);

      expect(buffer.push(2)).toBe(3);
      expect(Array.from(buffer)).toStrictEqual([0, 1, 2]);

      expect(buffer.push(3)).toBe(4);
      expect(Array.from(buffer)).toStrictEqual([0, 1, 2, 3]);
    });

    it("throws an error when buffer is full (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      buffer.push(0);

      expect(() => buffer.push(1)).toThrow();
    });

    it("throws an error when buffer is full (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);
      buffer.push(0);
      buffer.push(1);

      expect(() => buffer.push(2)).toThrow();
    });

    it("throws an error when buffer is full (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);
      buffer.push(0);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(() => buffer.push(4)).toThrow();
    });
  });

  describe("shift", () => {
    it("returns undefined if empty (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);

      expect(buffer.shift()).toBe(undefined);
    });

    it("removes and returns the first item if not empty (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      buffer.push(0);

      expect(buffer.shift()).toBe(0);
      expect(buffer.length).toBe(0);
      expect(Array.from(buffer)).toStrictEqual([]);
    });

    it("removes and returns the first item if not empty (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);
      buffer.push(0);
      buffer.push(1);

      expect(buffer.shift()).toBe(0);
      expect(buffer.length).toBe(1);
      expect(Array.from(buffer)).toStrictEqual([1]);

      expect(buffer.shift()).toBe(1);
      expect(buffer.length).toBe(0);
      expect(Array.from(buffer)).toStrictEqual([]);
    });

    it("removes and returns the first item if not empty (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);
      buffer.push(0);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(buffer.shift()).toBe(0);
      expect(buffer.length).toBe(3);
      expect(Array.from(buffer)).toStrictEqual([1, 2, 3]);

      expect(buffer.shift()).toBe(1);
      expect(buffer.length).toBe(2);
      expect(Array.from(buffer)).toStrictEqual([2, 3]);

      expect(buffer.shift()).toBe(2);
      expect(buffer.length).toBe(1);
      expect(Array.from(buffer)).toStrictEqual([3]);

      expect(buffer.shift()).toBe(3);
      expect(buffer.length).toBe(0);
      expect(Array.from(buffer)).toStrictEqual([]);
    });
  });

  describe("at", () => {
    it("returns the item (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(undefined);
      expect(buffer.at(0)).toBe(undefined);
      expect(buffer.at(1)).toBe(undefined);

      buffer.push(0);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(0);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(undefined);
    });

    it("returns the item (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(undefined);
      expect(buffer.at(0)).toBe(undefined);
      expect(buffer.at(1)).toBe(undefined);
      expect(buffer.at(2)).toBe(undefined);

      buffer.push(0);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(0);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(undefined);
      expect(buffer.at(2)).toBe(undefined);

      buffer.push(1);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(0);
      expect(buffer.at(-1)).toBe(1);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(1);
      expect(buffer.at(2)).toBe(undefined);
    });

    it("returns the item (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);
      expect(buffer.at(-5)).toBe(undefined);
      expect(buffer.at(-4)).toBe(undefined);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(undefined);
      expect(buffer.at(0)).toBe(undefined);
      expect(buffer.at(1)).toBe(undefined);
      expect(buffer.at(2)).toBe(undefined);
      expect(buffer.at(3)).toBe(undefined);
      expect(buffer.at(4)).toBe(undefined);

      buffer.push(0);
      expect(buffer.at(-5)).toBe(undefined);
      expect(buffer.at(-4)).toBe(undefined);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(undefined);
      expect(buffer.at(-1)).toBe(0);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(undefined);
      expect(buffer.at(2)).toBe(undefined);
      expect(buffer.at(3)).toBe(undefined);
      expect(buffer.at(4)).toBe(undefined);

      buffer.push(1);
      expect(buffer.at(-5)).toBe(undefined);
      expect(buffer.at(-4)).toBe(undefined);
      expect(buffer.at(-3)).toBe(undefined);
      expect(buffer.at(-2)).toBe(0);
      expect(buffer.at(-1)).toBe(1);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(1);
      expect(buffer.at(2)).toBe(undefined);
      expect(buffer.at(3)).toBe(undefined);
      expect(buffer.at(4)).toBe(undefined);

      buffer.push(2);
      expect(buffer.at(-5)).toBe(undefined);
      expect(buffer.at(-4)).toBe(undefined);
      expect(buffer.at(-3)).toBe(0);
      expect(buffer.at(-2)).toBe(1);
      expect(buffer.at(-1)).toBe(2);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(1);
      expect(buffer.at(2)).toBe(2);
      expect(buffer.at(3)).toBe(undefined);
      expect(buffer.at(4)).toBe(undefined);

      buffer.push(3);
      expect(buffer.at(-5)).toBe(undefined);
      expect(buffer.at(-4)).toBe(0);
      expect(buffer.at(-3)).toBe(1);
      expect(buffer.at(-2)).toBe(2);
      expect(buffer.at(-1)).toBe(3);
      expect(buffer.at(0)).toBe(0);
      expect(buffer.at(1)).toBe(1);
      expect(buffer.at(2)).toBe(2);
      expect(buffer.at(3)).toBe(3);
      expect(buffer.at(4)).toBe(undefined);
    });
  });

  describe("length", () => {
    it("returns the length (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      expect(buffer.length).toBe(0);

      buffer.push(0);
      expect(buffer.length).toBe(1);
    });

    it("returns the length (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);
      expect(buffer.length).toBe(0);

      buffer.push(0);
      expect(buffer.length).toBe(1);

      buffer.push(1);
      expect(buffer.length).toBe(2);
    });

    it("returns the length (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);
      expect(buffer.length).toBe(0);

      buffer.push(0);
      expect(buffer.length).toBe(1);

      buffer.push(1);
      expect(buffer.length).toBe(2);

      buffer.push(2);
      expect(buffer.length).toBe(3);

      buffer.push(3);
      expect(buffer.length).toBe(4);
    });
  });

  describe("[Symbol.iterator]", () => {
    it("iterates all items (capacity=1)", () => {
      const buffer = new RingBuffer<number>(1);
      expect(Array.from(buffer)).toStrictEqual([]);

      buffer.push(0);
      expect(Array.from(buffer)).toStrictEqual([0]);
    });

    it("iterates all items (capacity=2)", () => {
      const buffer = new RingBuffer<number>(2);
      expect(Array.from(buffer)).toStrictEqual([]);

      buffer.push(0);
      expect(Array.from(buffer)).toStrictEqual([0]);

      buffer.push(1);
      expect(Array.from(buffer)).toStrictEqual([0, 1]);
    });

    it("iterates all items (capacity=4)", () => {
      const buffer = new RingBuffer<number>(4);
      expect(Array.from(buffer)).toStrictEqual([]);

      buffer.push(0);
      expect(Array.from(buffer)).toStrictEqual([0]);

      buffer.push(1);
      expect(Array.from(buffer)).toStrictEqual([0, 1]);

      buffer.push(2);
      expect(Array.from(buffer)).toStrictEqual([0, 1, 2]);

      buffer.push(3);
      expect(Array.from(buffer)).toStrictEqual([0, 1, 2, 3]);
    });
  });
});
