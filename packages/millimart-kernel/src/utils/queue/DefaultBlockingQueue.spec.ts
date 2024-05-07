import { describe, expect, it } from "vitest";
import { fromAsync } from "../misc";
import { DefaultBlockingQueue } from "./DefaultBlockingQueue";

describe.skip("DefaultBlockingQueue", () => {
  it("is empty when created", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);
  });

  it("can enqueue if not full", async () => {
    const queue = new DefaultBlockingQueue<number>(3);

    await queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    await queue.enqueue(2);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    await queue.enqueue(3);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(true);
  });

  it("can not enqueue if full", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    await queue.enqueue(1);
    await queue.enqueue(2);
    await queue.enqueue(3);

    expect(async () => await queue.enqueue(4)).toThrow();
  });

  it("can dequeue if not empty", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    await queue.enqueue(1);
    await queue.enqueue(2);
    await queue.enqueue(3);

    expect(await queue.dequeue()).toBe(1);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    expect(await queue.dequeue()).toBe(2);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    expect(await queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);
  });

  it("can not dequeue if empty", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    expect(async () => await queue.dequeue()).toThrow();
  });

  it("drains nothing if empty", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    expect(await fromAsync(queue)).toStrictEqual([]);
    expect(queue.isEmpty()).toBe(true);
  });

  it("drains all values if not empty", async () => {
    const queue = new DefaultBlockingQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(await fromAsync(queue)).toStrictEqual([1, 2, 3]);
    expect(queue.isEmpty()).toBe(true);
  });
});
