import { Queue, QueueBuffer } from "./types";

export class DefaultQueue<T> implements Queue<T> {
  private buffer: QueueBuffer<T>;

  constructor(private capacity: number) {
    if (this.capacity < 1) {
      throw new RangeError("The capacity must be greateer than zero.");
    }
    this.buffer = new Array<T>();
  }

  dequeue(): T | undefined {
    return this.buffer.shift();
  }

  enqueue(value: T): boolean {
    if (this.isFull()) {
      return false;
    }
    this.buffer.push(value);
    return true;
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  isFull(): boolean {
    return this.buffer.length === this.capacity;
  }

  peek(): T | undefined {
    return this.buffer.at(0);
  }

  [Symbol.iterator](): Iterator<T> {
    const next = (): IteratorResult<T> => {
      const value = this.dequeue();
      return value !== undefined
        ? { done: false, value }
        : { done: true, value };
    };
    return { next };
  }
}
