import { describe, expect, it } from "vitest";
import { DefaultQueue } from "./DefaultQueue";

describe("DefaultQueue", () => {
  it("is empty when created", () => {
    const queue = new DefaultQueue<number>(2);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);
  });

  it("can enqueue if not full", () => {
    const queue = new DefaultQueue<number>(2);

    expect(queue.enqueue(0)).toBe(true);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    expect(queue.enqueue(1)).toBe(true);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(true);

    expect(queue.enqueue(2)).toBe(false);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(true);
  });

  it("can dequeue if not empty", () => {
    const queue = new DefaultQueue<number>(2);
    queue.enqueue(0);
    queue.enqueue(1);

    expect(queue.dequeue()).toBe(0);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    expect(queue.dequeue()).toBe(1);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);

    expect(queue.dequeue()).toBe(undefined);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);
  });

  it("drains nothing if empty", () => {
    const queue = new DefaultQueue<number>(3);
    expect(Array.from(queue)).toStrictEqual([]);
    expect(queue.isEmpty()).toBe(true);
  });

  it("drains all values if not empty", () => {
    const queue = new DefaultQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(Array.from(queue)).toStrictEqual([1, 2, 3]);
    expect(queue.isEmpty()).toBe(true);
  });
});
